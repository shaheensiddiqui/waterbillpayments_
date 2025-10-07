// backend/src/utils/validateBillInput.js
function validateBillInput(data) {
  const errors = [];

  // Bill number format
  if (!data.bill_number || !/^WB-\d{4}-\d{4}$/.test(data.bill_number))
    errors.push("Invalid bill number format (expected WB-YYYY-XXXX)");

  // Consumer name
  if (!data.consumer_name || data.consumer_name.trim().length < 2)
    errors.push("Consumer name must be at least 2 characters long");

  // Email
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("Invalid email address");

  // Address
  if (!data.address || data.address.trim().length < 10)
    errors.push("Address must be at least 10 characters long");

  // Service period
  if (!data.service_period_start || !data.service_period_end)
    errors.push("Service period start and end are required");

  if (
    new Date(data.service_period_start) >= new Date(data.service_period_end)
  )
    errors.push("Service start date must be before end date");

  // Due date
  if (!data.due_date) errors.push("Due date is required");
  else if (new Date(data.due_date) <= new Date(data.service_period_end))
    errors.push("Due date must be after service period end date");

  // Amounts
  if (data.base_amount == null || data.base_amount <= 0)
    errors.push("Base amount must be greater than 0");

  if (data.penalty_amount != null && data.penalty_amount < 0)
    errors.push("Penalty amount cannot be negative");

  const expectedTotal =
    Number(data.base_amount) + Number(data.penalty_amount || 0);
  if (Number(data.total_amount) !== expectedTotal)
    errors.push("Total amount must equal base + penalty");

  if (errors.length) throw new Error(errors.join("; "));
}

module.exports = { validateBillInput };
