<template>
  <div class="credits-card rpg-card rpg-card--plain">
    <div class="credits-card__links">
      <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener" class="credits-card__link">
        MIT License
      </a>
      <span class="credits-card__sep" aria-hidden="true">·</span>
      <a
        href="https://www.drivethrurpg.com/browse/pub/12037/Runehammer"
        target="_blank"
        rel="noopener"
        class="credits-card__link"
      >
        ICRPG by Runehammer
      </a>
      <span class="credits-card__sep" aria-hidden="true">·</span>
      <a href="https://www.random.org" target="_blank" rel="noopener" class="credits-card__link">
        True Random by Random.org
      </a>
    </div>
    <p class="credits-card__line">Fantasy Inspiration Tables by Nightworm</p>
    <a
      href="https://github.com/dudematthew/icrpg-combat-manager"
      target="_blank"
      rel="noopener"
      class="credits-card__link credits-card__link--solo"
    >
      View on GitHub
    </a>
  </div>
</template>

<style scoped>
.credits-card {
  padding: 1rem 1.25rem;
  text-align: center;
}

.credits-card__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
}

.credits-card__link {
  color: #dc2626;
  font-size: 0.75rem;
  text-decoration: underline;
}

.credits-card__link:hover {
  color: #b91c1c;
}

.credits-card__link--solo {
  display: inline-block;
}

.credits-card__sep {
  color: #a3a3a3;
  user-select: none;
}

.credits-card__line {
  margin: 0 0 0.5rem;
  color: #525252;
  font-size: 0.75rem;
}
</style>
