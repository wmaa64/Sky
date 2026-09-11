import connectDB, { sql } from "../lib/db";

/**
 * Get all payments for a specific session
 */
export const getSessionPayments = async (sessionID) => {
  if (!sessionID) {
    throw new Error("Session ID is required.");
  }

  const pool = await connectDB();

  const result = await pool
    .request()
    .input("SessionID", sql.Int, Number(sessionID))
    .query(`
      SELECT
          SP.SessionPaymentID,
          SP.PaymentDate,
          SP.AmountPaid,
          SP.PaymentMethod,
          SP.Notes,
          U.FullName AS UserName
      FROM SessionPayments SP
      INNER JOIN Users U
          ON SP.UserID = U.UserID
      WHERE SP.SessionID = @SessionID
      ORDER BY SP.PaymentDate DESC
    `);

  return result.recordset;
};


/**
 * Create a new payment
 */
export const createSessionPayment = async ({
  sessionID,
  patientID,
  amountPaid,
  paymentMethod,
  notes,
  userID,
}) => {
  if (!sessionID) {
    throw new Error("Session ID is required.");
  }

  if (!patientID) {
    throw new Error("Patient ID is required.");
  }

  if (amountPaid === undefined || amountPaid === null || amountPaid === "") {
    throw new Error("Payment amount is required.");
  }

  const amount = Number(amountPaid);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  if (!userID) {
    throw new Error("User ID is required.");
  }

  const pool = await connectDB();

  const result = await pool
    .request()
    .input("SessionID", sql.Int, Number(sessionID))
    .input("PatientID", sql.Int, Number(patientID))
    .input("AmountPaid", sql.Decimal(18, 2), amount)
    .input(
      "PaymentMethod",
      sql.NVarChar(50),
      paymentMethod || null
    )
    .input(
      "Notes",
      sql.NVarChar(500),
      notes || null
    )
    .input("UserID", sql.Int, Number(userID))
    .query(`
      INSERT INTO SessionPayments
      (
          SessionID,
          PatientID,
          AmountPaid,
          PaymentMethod,
          Notes,
          UserID
      )
      OUTPUT
          INSERTED.SessionPaymentID,
          INSERTED.SessionID,
          INSERTED.PatientID,
          INSERTED.PaymentDate,
          INSERTED.AmountPaid,
          INSERTED.PaymentMethod,
          INSERTED.Notes,
          INSERTED.UserID,
          INSERTED.CreatedAt
      VALUES
      (
          @SessionID,
          @PatientID,
          @AmountPaid,
          @PaymentMethod,
          @Notes,
          @UserID
      )
    `);

  return result.recordset[0];
};


/**
 * Update an existing payment
 */
export const updateSessionPayment = async ({
  paymentID,
  amountPaid,
  paymentMethod,
  notes,
}) => {
  if (!paymentID) {
    throw new Error("Payment ID is required.");
  }

  if (amountPaid === undefined || amountPaid === null || amountPaid === "") {
    throw new Error("Payment amount is required.");
  }

  const amount = Number(amountPaid);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const pool = await connectDB();

  const result = await pool
    .request()
    .input(
      "SessionPaymentID",
      sql.Int,
      Number(paymentID)
    )
    .input(
      "AmountPaid",
      sql.Decimal(18, 2),
      amount
    )
    .input(
      "PaymentMethod",
      sql.NVarChar(50),
      paymentMethod || null
    )
    .input(
      "Notes",
      sql.NVarChar(500),
      notes || null
    )
    .query(`
      UPDATE SessionPayments
      SET
          AmountPaid = @AmountPaid,
          PaymentMethod = @PaymentMethod,
          Notes = @Notes
      OUTPUT
          INSERTED.SessionPaymentID,
          INSERTED.SessionID,
          INSERTED.PatientID,
          INSERTED.PaymentDate,
          INSERTED.AmountPaid,
          INSERTED.PaymentMethod,
          INSERTED.Notes,
          INSERTED.UserID,
          INSERTED.CreatedAt
      WHERE SessionPaymentID = @SessionPaymentID
    `);

  if (result.recordset.length === 0) {
    throw new Error("Payment record not found.");
  }

  return result.recordset[0];
};


/**
 * Delete an existing payment
 */
export const deleteSessionPayment = async (paymentID) => {
  if (!paymentID) {
    throw new Error("Payment ID is required.");
  }

  const pool = await connectDB();

  const result = await pool
    .request()
    .input(
      "SessionPaymentID",
      sql.Int,
      Number(paymentID)
    )
    .query(`
      DELETE FROM SessionPayments
      OUTPUT
          DELETED.SessionPaymentID,
          DELETED.SessionID,
          DELETED.PatientID,
          DELETED.AmountPaid
      WHERE SessionPaymentID = @SessionPaymentID
    `);

  if (result.recordset.length === 0) {
    throw new Error("Payment record not found.");
  }

  return result.recordset[0];
};