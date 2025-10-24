<template>
  <div class="user-costs-dropdown" v-if="visible">
    <div class="costs-grid">
      <div v-for="monthData in costs" :key="monthData.month" class="month-card">
        <h4 class="month-header">{{ formatMonth(monthData.month) }}</h4>
        <ul class="provider-list">
          <li v-for="provider in monthData.providers" :key="provider.providerName">
            <span class="provider-name">{{ provider.providerName }}:</span>
            <span class="cost-details">
              {{ provider.requestCount }} appels x {{ formatCurrency(provider.costPerRequest) }} = <strong>{{ formatCurrency(provider.totalCost) }}</strong>
            </span>
          </li>
        </ul>
        <div class="total-month-cost">
          Total: <strong>{{ formatCurrency(monthData.totalMonthCost) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserCostsDropdown',
  props: {
    costs: {
      type: Array,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatMonth(monthStr) {
      const [year, month] = monthStr.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
    },
  },
};
</script>

<style scoped>
.user-costs-dropdown {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.costs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.month-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
}

.month-header {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.provider-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
}

.provider-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  color: #6b7280;
}

.provider-name {
  font-weight: 500;
}

.cost-details {
  text-align: right;
}

.total-month-cost {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
  text-align: right;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}
</style>
