<script setup lang="ts">
import { BookOpen, GraduationCap, Headphones, Play } from '@lucide/vue'

import LibraryHeroSlider from '@/components/LibraryHeroSlider.vue'
</script>

<template>
  <section class="page-shell pb-5 md:pb-7">
    <div class="hero-section-grid">
      <LibraryHeroSlider />

      <aside class="hero-welcome-card">
        <div class="hero-welcome-card__sign">
          <p>Xin chào!</p>
          <span>Hôm nay bạn muốn đọc sách gì nào?</span>
        </div>

        <div class="hero-welcome-card__stats">
          <div class="hero-stat">
            <BookOpen :size="30" />
            <strong>1.250+</strong>
            <span>Đầu sách</span>
          </div>
          <div class="hero-stat">
            <GraduationCap :size="30" />
            <strong>320+</strong>
            <span>Học liệu</span>
          </div>
          <div class="hero-stat">
            <Play :size="30" />
            <strong>50+</strong>
            <span>Video</span>
          </div>
          <div class="hero-stat">
            <Headphones :size="30" />
            <strong>20+</strong>
            <span>Sách nói</span>
          </div>
          <div class="hero-stat">
            <Headphones :size="30" />
            <strong>20+</strong>
            <span>Audio</span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.hero-section-grid {
  display: grid;
  gap: 18px;
}

.hero-welcome-card {
  position: relative;
  display: none;
  min-height: 268px;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.92);
  border-radius: 26px;
  background:
    radial-gradient(circle at 92% 9%, #fff4f6 0 3rem, transparent 3.1rem),
    linear-gradient(180deg, #bcefff 0%, #e7f7ff 100%);
  box-shadow: 0 22px 60px -36px rgb(24 32 51 / 0.55);
}

.hero-welcome-card::after {
  position: absolute;
  right: 24px;
  top: -6px;
  width: 90px;
  height: 132px;
  border-radius: 50% 50% 46% 46%;
  background: repeating-linear-gradient(90deg, #fff1f2 0 21px, #fb7185 22px 42px);
  box-shadow: 0 16px 26px -20px rgb(24 32 51 / 0.7);
  content: '';
}

.hero-welcome-card::before {
  position: absolute;
  right: 68px;
  top: 112px;
  z-index: 1;
  width: 2px;
  height: 76px;
  background: #a16207;
  content: '';
}

.hero-welcome-card__sign {
  position: relative;
  z-index: 2;
  width: min(245px, calc(100% - 120px));
  margin: 18px 0 0 34px;
  padding: 18px 20px;
  border-radius: 16px;
  color: #7a431b;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.18), transparent),
    #f2c686;
  box-shadow: inset 0 -5px rgb(122 67 27 / 0.12), 0 12px 24px -20px rgb(122 67 27 / 0.7);
  text-align: center;
}

.hero-welcome-card__sign p {
  font-size: 25px;
  font-weight: 900;
}

.hero-welcome-card__sign span {
  display: block;
  margin-top: 7px;
  font-weight: 900;
  line-height: 1.45;
}

.hero-welcome-card__stats {
  position: absolute;
  inset: auto 22px 22px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  min-height: 130px;
  align-items: center;
  border-radius: 22px;
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 16px 34px -24px rgb(24 32 51 / 0.55);
}

.hero-stat {
  display: grid;
  min-width: 0;
  place-items: center;
  gap: 7px;
  border-right: 1px solid #f0ded4;
  text-align: center;
}

.hero-stat:last-child {
  border-right: 0;
}

.hero-stat:nth-child(1) {
  color: #f5a623;
}

.hero-stat:nth-child(2) {
  color: #315fd7;
}

.hero-stat:nth-child(3) {
  color: #ef4444;
}

.hero-stat:nth-child(4) {
  color: #8757f2;
}

.hero-stat:nth-child(5) {
  color: #a855f7;
}

.hero-stat strong {
  font-size: 18px;
  font-weight: 900;
}

.hero-stat span {
  color: #17213a;
  font-size: 12px;
  font-weight: 800;
}

@media (min-width: 768px) {
  .hero-section-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 1280px) {
  .hero-section-grid {
    grid-template-columns: minmax(0, 1fr) 390px;
  }

  .hero-welcome-card {
    display: block;
  }
}
</style>
