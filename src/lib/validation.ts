import type { Case } from "../types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCase(c: Case): ValidationError[] {
  const errors: ValidationError[] = [];

  // Person validation
  if (!c.person.displayId?.trim()) {
    errors.push({ field: "Person ID", message: "Enter person name or ID" });
  }
  if (c.person.age < 16 || c.person.age > 120) {
    errors.push({ field: "Age", message: "Age must be between 16 and 120" });
  }

  // Charges validation
  if (!c.charges.length) {
    errors.push({ field: "Charges", message: "At least one charge is required" });
  }
  c.charges.forEach((charge, i) => {
    if (!charge.statute?.trim()) {
      errors.push({ field: `Charge ${i + 1}`, message: "Statute is required" });
    }
    if (!charge.section?.trim()) {
      errors.push({ field: `Charge ${i + 1}`, message: "Section is required" });
    }
    if (!charge.offenceName?.trim()) {
      errors.push({ field: `Charge ${i + 1}`, message: "Offence name is required" });
    }
    if (charge.maxImprisonmentYears === null || charge.maxImprisonmentYears < 0) {
      errors.push({ field: `Charge ${i + 1}`, message: "Maximum imprisonment must be 0 or greater" });
    }
    if (charge.isBailable === "unknown") {
      errors.push({ field: `Charge ${i + 1}`, message: "Specify if offence is bailable" });
    }
  });

  // Custody validation
  if (!c.custody.arrestDate) {
    errors.push({ field: "Arrest Date", message: "Arrest date is required" });
  }
  if (!c.custody.custodyStartDate) {
    errors.push({ field: "Custody Start Date", message: "Custody start date is required" });
  }
  
  // Date logic validation
  if (c.custody.arrestDate && c.custody.custodyStartDate) {
    const arrestDate = new Date(c.custody.arrestDate);
    const custodyDate = new Date(c.custody.custodyStartDate);
    
    if (arrestDate > custodyDate) {
      errors.push({ field: "Dates", message: "Arrest date cannot be after custody start date" });
    }
    if (custodyDate > new Date()) {
      errors.push({ field: "Custody Date", message: "Custody date cannot be in the future" });
    }
  }

  if (c.custody.chargesheetFiled === "unknown") {
    errors.push({ field: "Chargesheet Status", message: "Specify chargesheet filing status" });
  }

  // Court/Stage validation
  if (!c.status.currentCourt?.trim()) {
    errors.push({ field: "Current Court", message: "Court information is required" });
  }
  if (!c.status.caseStage?.trim()) {
    errors.push({ field: "Case Stage", message: "Case stage is required" });
  }

  return errors;
}
