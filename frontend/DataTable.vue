<script setup>
defineProps({
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, required: true },
  rowKey: { type: String, required: true },
  emptyText: { type: String, default: 'No records found.' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
          <th v-if="$slots.actions" scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td class="muted" :colspan="columns.length + ($slots.actions ? 1 : 0)">Loading...</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td class="muted" :colspan="columns.length + ($slots.actions ? 1 : 0)">{{ emptyText }}</td>
        </tr>
        <template v-else>
          <tr v-for="row in rows" :key="row[rowKey]">
            <td v-for="column in columns" :key="column.key">{{ row[column.key] }}</td>
            <td v-if="$slots.actions" class="actions"><slot name="actions" :row="row" /></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
