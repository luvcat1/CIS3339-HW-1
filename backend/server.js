require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Location of the Vue production build (override with CLIENT_DIST in .env)
const CLIENT_DIST = process.env.CLIENT_DIST
    ? path.resolve(process.env.CLIENT_DIST)
    : path.join(__dirname, 'client', 'dist');

/* --------------------------- Database & models -------------------------- */

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not set. Add it to your .env file.');
    }

    await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
}

// Keep API responses free of Mongo internals
const hideInternals = {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
};

const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        id: { type: String, required: true, unique: true, trim: true },
        phone: { type: String, required: true, trim: true },
        zip: { type: String, required: true, trim: true },
    },
    { toJSON: hideInternals }
);

const courseSchema = new mongoose.Schema(
    {
        courseId: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
    },
    { toJSON: hideInternals }
);

const enrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    },
    { timestamps: true }
);

// A student can enroll in a given course only once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
// Speeds up course-roster lookups
enrollmentSchema.index({ course: 1 });

// Deleting a student or course automatically removes its enrollments
studentSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Enrollment.deleteMany({ student: doc._id });
    }
});
courseSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Enrollment.deleteMany({ course: doc._id });
    }
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

const isDuplicateKeyError = (error) => error && error.code === 11000;

/* ------------------------------ Students ------------------------------ */

// Search for a student by name
app.post('/find-student', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ error: 'Student name is required' });
        }

        const student = await Student.findOne({ name });
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        res.send(student);
    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Save a student
app.post('/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;
        if (!name || !id || !phone || !zip) {
            return res.status(400).send({ error: 'All fields (name, id, phone, zip) are required' });
        }

        const student = await Student.create({ name, id, phone, zip });
        res.status(201).send({ message: 'Student added successfully', student });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).send({ error: 'A student with this ID already exists' });
        }
        console.error('Error adding student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Delete a student by id (preferred) or name; their enrollments are removed automatically
app.post('/delete-student', async (req, res) => {
    try {
        const { name, id } = req.body;
        if (!name && !id) {
            return res.status(400).send({ error: 'Student id or name is required' });
        }

        const filter = id ? { id: String(id) } : { name };
        const deletedStudent = await Student.findOneAndDelete(filter);
        if (!deletedStudent) {
            return res.status(404).send({ error: 'Student not found' });
        }

        res.send({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

/* ------------------------------ Courses ------------------------------- */

// Create a course
app.post('/api/courses', async (req, res) => {
    try {
        const { courseId, title, description } = req.body;
        if (!courseId || !title) {
            return res.status(400).send({ error: 'Fields courseId and title are required' });
        }

        const course = await Course.create({ courseId, title, description });
        res.status(201).send({ message: 'Course created successfully', course });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).send({ error: 'A course with this ID already exists' });
        }
        console.error('Error creating course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// List all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ courseId: 1 });
        res.send(courses);
    } catch (error) {
        console.error('Error listing courses:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Delete a course; its enrollments are removed automatically
app.delete('/api/courses/:courseId', async (req, res) => {
    try {
        const deletedCourse = await Course.findOneAndDelete({ courseId: req.params.courseId });
        if (!deletedCourse) {
            return res.status(404).send({ error: 'Course not found' });
        }

        res.send({ message: 'Course deleted successfully', course: deletedCourse });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

/* ---------------------------- Enrollments ----------------------------- */

// Enroll a student in a course
app.post('/api/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).send({ error: 'Fields studentId and courseId are required' });
        }

        const [student, course] = await Promise.all([
            Student.findOne({ id: String(studentId) }),
            Course.findOne({ courseId: String(courseId) }),
        ]);
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }
        if (!course) {
            return res.status(404).send({ error: 'Course not found' });
        }

        const enrollment = await Enrollment.create({ student: student._id, course: course._id });
        res.status(201).send({
            message: 'Enrollment created successfully',
            enrollment: {
                studentId: student.id,
                courseId: course.courseId,
                enrolledAt: enrollment.createdAt,
            },
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).send({ error: 'Student is already enrolled in this course' });
        }
        console.error('Error creating enrollment:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Get the roster (enrolled students) for a course
app.get('/api/courses/:courseId/roster', async (req, res) => {
    try {
        const course = await Course.findOne({ courseId: req.params.courseId });
        if (!course) {
            return res.status(404).send({ error: 'Course not found' });
        }

        const enrollments = await Enrollment.find({ course: course._id }).populate('student');
        const students = enrollments.map((enrollment) => enrollment.student).filter(Boolean);

        res.send({ course, count: students.length, students });
    } catch (error) {
        console.error('Error fetching roster:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

/* ------------------------- Vue production build ------------------------ */

if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));

    // SPA fallback for client-side routes (Express 5 safe: no '*' route pattern)
    app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
} else {
    console.warn(`Vue build not found at ${CLIENT_DIST}. Run the client build to serve the frontend.`);
}

/* -------------------------------- Start -------------------------------- */

async function start() {
    try {
        await connectDB();
        // Make sure unique indexes exist before accepting requests
        await Promise.all([Student.init(), Course.init(), Enrollment.init()]);

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

start();