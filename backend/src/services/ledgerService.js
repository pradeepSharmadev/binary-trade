import User from "../models/User.js";
import LedgerEntry from "../models/LedgerEntry.js";


// initial demo balance
export async function recordInitialBalance(user) {
  const exists = await LedgerEntry.exists({ userId: user._id, type: "INITIAL" });
  if (!exists) {
    await LedgerEntry.create({
      userId: user._id,
      type: "INITIAL",
      amount: 10000,
      balanceAfter: user.demoBalance
    });
  }
}

// debit stake for trade
export async function debitStake(userId, amount, tradeId) {
  const user = await User.findById(userId);
  if (!user || user.demoBalance < amount) throw new Error("Insufficient demo balance");
  user.demoBalance = Number((user.demoBalance - amount).toFixed(2));
  await user.save();

  await LedgerEntry.create({
    userId,
    type: "STAKE",
    amount: -amount,
    tradeId,
    balanceAfter: user.demoBalance
  });

  return user.demoBalance;
}

// credit if win
export async function credit(userId, amount, tradeId, type = "PAYOUT") {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.demoBalance = Number((user.demoBalance + amount).toFixed(2));
  await user.save();

  await LedgerEntry.create({
    userId,
    type,
    amount,
    tradeId,
    balanceAfter: user.demoBalance
  });

  return user.demoBalance;
}
