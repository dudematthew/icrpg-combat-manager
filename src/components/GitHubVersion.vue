<template>
    <span class="github-version">
        <span @click="toggleCommits" class="version-text"
            :class="{ 'loading': loading, 'clickable': !loading && recentCommits.length > 0 }"
            :title="loading ? 'Loading version...' : recentCommits.length > 0 ? 'Click to view recent commits' : 'Version info'">
            <span v-if="loading" class="loading-text">Loading...</span>
            <span v-else>Version {{ commitCount || '?' }}</span>
        </span>

        <!-- Recent Commits Popup -->
        <Teleport to="body">
            <div v-if="showCommits && recentCommits.length > 0" class="commits-overlay" @click="closeCommits">
                <div class="commits-popup rpg-card" @click.stop>
                    <div class="commits-header">
                        <h3 class="commits-title">Recent Commits</h3>
                        <button @click="closeCommits" class="close-button">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div class="commits-list">
                        <div v-for="commit in recentCommits.slice(0, 5)" :key="commit.sha" class="commit-item">
                            <div class="commit-hash">{{ commit.sha.substring(0, 7) }}</div>
                            <div class="commit-message">{{ commit.commit.message.split('\n')[0] }}</div>
                            <div class="commit-date">{{ formatDate(commit.commit.author.date) }}</div>
                        </div>
                    </div>

                    <div class="commits-footer">
                        <a :href="`https://github.com/dudematthew/icrpg-combat-manager/commits`" target="_blank"
                            class="view-all-link">
                            View all commits on GitHub →
                        </a>
                    </div>
                </div>
            </div>
        </Teleport>
    </span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      date: string
    }
  }
}

const loading = ref(true)
const commitCount = ref<number | null>(null)
const recentCommits = ref<GitHubCommit[]>([])
const showCommits = ref(false)
const error = ref<string | null>(null)

const REPO_OWNER = 'dudematthew'
const REPO_NAME = 'icrpg-combat-manager'
const GITHUB_API_BASE = 'https://api.github.com'

const fetchVersionInfo = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch recent commits (this also gives us commit count)
    const commitsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=100`
    )
    
    if (!commitsResponse.ok) {
      throw new Error(`GitHub API error: ${commitsResponse.status}`)
    }
    
    const commits: GitHubCommit[] = await commitsResponse.json()
    recentCommits.value = commits
    
    // Set commit count (GitHub API only returns up to 100 commits per page)
    // For accurate total count, we'd need to paginate, but for a small project this is fine
    commitCount.value = commits.length
    
  } catch (err) {
    console.warn('Failed to fetch GitHub version info:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
    // Fallback to a static version if API fails
    commitCount.value = 6 // Based on what we saw in git log
  } finally {
    loading.value = false
  }
}

const toggleCommits = () => {
  if (recentCommits.value.length > 0) {
    showCommits.value = !showCommits.value
  }
}

const closeCommits = () => {
  showCommits.value = false
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchVersionInfo()
})
</script>

<style scoped>
.github-version {
    position: relative;
    display: inline;
}

.version-text {
    font-family: 'Chalkduster', cursive;
    font-size: inherit;
    color: inherit;
    transition: all 0.2s ease;
}

.version-text.clickable {
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: transparent;
}

.version-text.clickable:hover {
    color: #dc2626;
    text-decoration-color: currentColor;
}

.version-text.loading {
    opacity: 0.7;
    cursor: default;
}

.loading-text {
    font-style: italic;
}

.commits-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.commits-popup {
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.commits-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #dc2626;
}

.commits-title {
    font-family: 'FlatBread', 'Chalkduster', cursive;
    font-weight: 900;
    font-size: 1.125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #dc2626;
    margin: 0;
}

.close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: #6b7280;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-button:hover {
    background: rgba(107, 114, 128, 0.1);
    color: #374151;
}

.commits-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
}

.commit-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.commit-item:last-child {
    border-bottom: none;
}

.commit-hash {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.commit-message {
    font-family: 'nusaliver', 'Arial', sans-serif;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.25rem;
    line-height: 1.4;
}

.commit-date {
    font-size: 0.75rem;
    color: #9ca3af;
}

.commits-footer {
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
}

.view-all-link {
    color: #dc2626;
    text-decoration: none;
    font-family: 'nusaliver', 'Arial', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    transition: color 0.2s ease;
}

.view-all-link:hover {
    color: #991b1b;
    text-decoration: underline;
}
</style>