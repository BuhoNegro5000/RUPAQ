<div class="skeleton-hoy" aria-busy="true" aria-label="Cargando el pronóstico de tu distrito">
  <span class="sr-only">Cargando el pronóstico de tu distrito…</span>
  <div class="line skeleton" style="width: 62%; height: 17px;"></div>
  <div class="temp skeleton" style="width: 55%; height: clamp(7.4rem, 30vw, 10rem); margin-top: 10px;"></div>
  <div class="risk-line">
    <div class="skeleton" style="width: 42%; height: 16px;"></div>
    <div class="skeleton" style="width: 22%; height: 16px;"></div>
  </div>
  <div class="action">
    <div class="skeleton" style="width: 96%; height: 30px;"></div>
    <div class="skeleton" style="width: 88%; height: 30px; margin-top: 8px;"></div>
    <div class="skeleton" style="width: 58%; height: 30px; margin-top: 8px;"></div>
  </div>
  <div class="arc skeleton"></div>
  <div class="metrics">
    <div class="skeleton" style="width: 40%; height: 18px;"></div>
    <div class="skeleton" style="width: 34%; height: 18px;"></div>
  </div>
</div>

<style>
  .skeleton-hoy {
    padding-top: 6px;
  }
  .line {
    border-radius: 4px;
  }
  .temp {
    border-radius: 8px;
  }
  .risk-line {
    display: flex;
    justify-content: space-between;
    margin-top: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--hairline);
  }
  .action {
    padding: 22px 0 20px;
    border-bottom: 1px solid var(--hairline);
  }
  .arc {
    height: 132px;
    margin-top: 18px;
    border-radius: 8px;
  }
  .metrics {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--hairline);
  }
  @media (min-width: 900px) {
    .arc {
      height: 200px;
    }
  }
</style>
