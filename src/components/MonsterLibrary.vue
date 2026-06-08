<template>
  <div id="library" class="monster-library mb-3 rpg-card">
    <div class="rpg-card-header">
      <BookMarked class="flex-shrink-0 w-5 h-5 text-accent" />
      <h2 class="rpg-heading">Library</h2>
      <span class="text-neutral-500 text-sm">({{ libraryStore.templates.length }})</span>
    </div>

    <EmptySectionState
      v-if="libraryStore.templates.length === 0"
      image="images/shelf_of_monsters.png"
      alt="Empty monster shelf"
      message="No saved monsters yet"
      hint="Save templates from the creator"
      :creator-above="isCreatorAbove"
      @jump="scrollToCreator"
    />

    <div v-else class="space-y-2">
      <div
        v-for="(template, index) in libraryStore.templates"
        :key="index"
        class="flex items-center gap-2 bg-neutral-50 p-2 border border-neutral-200 rounded-lg"
        :class="{ 'library-row-menu-open': openMenuIndex === index }"
      >
        <span
          class="flex-shrink-0 w-3 h-3 rounded-full border border-neutral-300"
          :style="{ backgroundColor: getMonsterColor(template.color) }"
        />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm rpg-heading truncate">
            {{ template.label || template.name || `${template.color} Tier ${template.tier}` }}
          </div>
          <div class="text-neutral-600 text-xs truncate">
            Tier {{ template.tier }} · {{ template.color }} · {{ template.heartsMax }}♥
          </div>
        </div>
        <button
          type="button"
          class="flex-shrink-0 text-xs rpg-button rpg-button-primary rpg-button-sm"
          @click="deploy(index)"
        >
          Deploy
        </button>
        <div class="relative">
          <button
            type="button"
            class="rpg-icon-button rpg-icon-button-neutral"
            @click="toggleMenu(index)"
          >
            ···
          </button>
          <div
            v-if="openMenuIndex === index"
            class="right-0 z-50 absolute bg-white shadow-lg mt-1 py-1 border border-neutral-200 rounded-md min-w-[8rem]"
          >
            <button type="button" class="block hover:bg-neutral-50 px-3 py-1.5 w-full text-left text-xs" @click="duplicate(index)">
              Duplicate
            </button>
            <button type="button" class="block hover:bg-neutral-50 px-3 py-1.5 w-full text-left text-xs text-danger" @click="remove(index)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="libraryStore.templates.length > 0" class="flex justify-center mt-4">
      <button
        type="button"
        class="flex justify-center items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1 text-xs transition-colors cursor-pointer"
        @click="scrollToBattlefield"
      >
        <ChevronUp v-if="isBattlefieldAbove" class="w-3 h-3" />
        <ChevronDown v-else class="w-3 h-3" />
        Jump to Battlefield
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BookMarked, ChevronDown, ChevronUp } from "lucide-vue-next";
import EmptySectionState from "@/components/EmptySectionState.vue";
import { useMonsterLibraryStore } from "@/stores/monsterLibrary";
import { getMonsterColor } from "@/utils/combat";

defineProps<{
  isCreatorAbove: boolean;
  isBattlefieldAbove: boolean;
}>();

const libraryStore = useMonsterLibraryStore();
const openMenuIndex = ref<number | null>(null);

const scrollToCreator = () => {
  document.getElementById("monster-creator")?.scrollIntoView({ behavior: "smooth" });
};

const scrollToBattlefield = () => {
  document.getElementById("battlefield")?.scrollIntoView({ behavior: "smooth" });
};

const toggleMenu = (index: number) => {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
};

const deploy = (index: number) => {
  libraryStore.deployToBattlefield(index);
  openMenuIndex.value = null;
};

const duplicate = (index: number) => {
  libraryStore.duplicateTemplate(index);
  openMenuIndex.value = null;
};

const remove = (index: number) => {
  libraryStore.removeTemplate(index);
  openMenuIndex.value = null;
};
</script>

<style scoped>
/* .rpg-card sets overflow:hidden for the top accent bar; allow menus to escape */
.monster-library.rpg-card {
  overflow: visible;
}

.library-row-menu-open {
  position: relative;
  z-index: 50;
}
</style>
