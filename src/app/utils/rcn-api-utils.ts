/* tslint:disable:no-unused */
import { LoanApiDiaspore, LoanState, LoanConfig } from './../interfaces/loan-api-diaspore';

export class RcnApiUtils {
  static getDueTime(loan:  LoanApiDiaspore) {
    const { config, state } = loan;
    const lastPayment = parseInt(state.last_payment, 10);
    const duration = parseInt(config.duration, 10);
    const lentTime = parseInt(config.lent_time, 10);
    let last: number;
    if (lastPayment !== 0) {
      last = lastPayment;
    } else {
      last = duration;
    }
    const dueTime = last - (last % duration) + lentTime;
    return dueTime;
  }

  static getClosingObligation(loan: LoanApiDiaspore, now = null) {
    if (now === null) {
      now = new Date().getTime();
    }

    const { state, config } = loan;
    const { installments, cuota, lent_time: lentTime } = config;

    const currentClock = now - parseInt(lentTime, 10);
    const clock = parseInt(state.clock, 10);

    let interest: number;
    if (clock >= currentClock) {
      interest = parseInt(state.interest, 10);
    } else {
      const { time_unit: timeUnit, duration, interest_rate: interestRate } = config;
      const { interest: newInterest } = this.runAdvanceClock(
          clock,
          timeUnit,
          parseInt(state.interest, 10),
          duration,
          cuota,
          installments,
          parseInt(state.paid_base, 10),
          interestRate,
          currentClock
      );
      interest = newInterest;
    }

    const debt = (cuota as any) * (installments as any) + interest;
    const paid = parseInt(state.paid, 10);

    let closingObligation;
    if (debt > paid) {
      closingObligation = debt - paid;
    } else {
      closingObligation = 0;
    }

    return closingObligation;
  }

  static getEstimateObligation(loan: LoanApiDiaspore, now = null) {
    const clossingObligation = this.getClosingObligation(loan, now);
    return clossingObligation;
  }

  static getObligation(loan: LoanApiDiaspore, timestamp) {
    const { state, config } = loan;

    const lentTime = parseInt(config.lent_time, 10);
    const duration = parseInt(config.duration, 10);
    const installments = parseInt(config.installments, 10);
    const cuota = parseInt(config.cuota, 10);

    if (timestamp < lentTime) {
      return { obligation: 0, defined: true };
    }

    let currentClock = timestamp - lentTime;
    const base = this.baseDebt(
        currentClock,
        duration,
        installments,
        cuota
    );

    const prevInterest = parseInt(state.interest, 10);
    const clock = parseInt(state.clock, 10);

    let interest;
    let defined;
    if (clock >= currentClock) {
      interest = prevInterest;
      defined = true;
    } else {
      const { interest: newInterest, clock: newClock } = this.simRunClock(
        clock,
        currentClock,
        prevInterest,
        config,
        state
      );
      interest = newInterest;
      currentClock = newClock;
      defined = prevInterest === interest;
    }

    const debt = base + interest;
    const paid = parseInt(state.paid, 10);

    let obligation;
    if (debt > paid) {
      obligation = debt - paid;
    } else {
      obligation = 0;
    }

    return { obligation, defined };
  }

  protected static runAdvanceClock(
    clock,
    timeUnit,
    interest,
    duration,
    cuota,
    installments,
    paidBase,
    interestRate,
    targetClock
  ) {
    let doCondition = true;

    while (doCondition) {
      const { delta, installmentCompleted } = this.calcDelta(
        targetClock - clock,
        clock,
        duration,
        installments
      );

      const newInterest = this.newInterest(
          clock,
          timeUnit,
          duration,
          installments,
          cuota,
          paidBase,
          delta,
          interestRate
      );

      if (installmentCompleted || newInterest > 0) {
        clock += delta;
        interest += newInterest;
      } else {
        break;
      }

      doCondition = clock < targetClock;
    }

    return { interest, clock };
  }

  protected static newInterest(
    clock,
    timeUnit,
    duration,
    installments,
    cuota,
    paidBase,
    delta,
    interestRate
  ) {
    const runningDebt = this.baseDebt(clock, duration, installments, cuota) - paidBase;
    const newInterest = (100000 * (delta / timeUnit) * runningDebt) / (interestRate / timeUnit);

    // assert new_interest < U_128_OVERFLOW
    return newInterest;
  }

  protected static calcDelta(targetDelta, clock, duration, installments) {
    const nextInstallmentDelta = duration - clock % duration;

    // duration < installments:
    let delta;
    let installmentCompleted;
    if (nextInstallmentDelta <= targetDelta && clock) {
      delta = nextInstallmentDelta;
      installmentCompleted = true;
    } else {
      delta = targetDelta;
      installmentCompleted = false;
    }

    return { delta, installmentCompleted };
  }

  protected static baseDebt (clock, duration, installments, cuota) {
    const installment = clock; // duration

    let base;
    if (installment < installments) {
      base = installment * cuota;
    } else {
      base = installments * cuota;
    }

    return base;
  }

  protected static simRunClock(clock, targetClock, prevInterest, config: LoanConfig, state: LoanState) {
    const { interest, clock: newClock } = this.runAdvanceClock(
        clock,
        parseInt(config.time_unit, 10),
        prevInterest,
        parseInt(config.duration, 10),
        parseInt(config.cuota, 10),
        parseInt(config.installments, 10),
        parseInt(state.paid_base, 10),
        parseInt(config.interest_rate, 10),
        targetClock
    );
    clock = newClock;

    return { interest, clock };
  }
}
