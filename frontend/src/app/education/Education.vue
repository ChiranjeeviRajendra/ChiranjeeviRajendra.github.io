<template>
  <section class="education" aria-label="Education">
    <article class="card">
      <h2>Post Graduation</h2>
      <dl>
        <dt>Institute:</dt><dd>B.N. Bahadur Institute Of Management Sciences</dd>
        <dt>Year:</dt><dd>2018</dd>
        <dt>Score:</dt><dd>62%</dd>
      </dl>
    </article>
    <article class="card">
      <h2>Under Graduation</h2>
      <dl>
        <dt>Institute:</dt><dd>Vidhya Ashram First Grade College</dd>
        <dt>Year:</dt><dd>2016</dd>
        <dt>Score:</dt><dd>76%</dd>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.education {
  display: grid;
  gap: 22px;
}

dl {
  margin-bottom: 0;
}

dt {
  font-weight: 600;
}

dd {
  margin: 4px 0 16px;
}

dd:last-child {
  margin-bottom: 0;
}
</style>
