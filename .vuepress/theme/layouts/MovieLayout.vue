<template>
  <ParentLayout>
    <template #page-bottom>
      <div class="container">
        <div class="filters nav-links">
          <div>
            <strong>观影年份</strong>
            <div class="nav-item" v-for="year in watchYearOptions" :key="year">
              <a
                href="#"
                class="nav-link"
                :class="{ 'router-link-active': curYear === year }"
                @click.prevent="selectYear(year)"
                >{{ year }}</a
              >
            </div>
            <div class="nav-item">
              <a
                href="#"
                class="nav-link"
                :class="{ 'router-link-active': curYear === null }"
                @click.prevent="selectYear(null)"
                >不限</a
              >
            </div>
          </div>
          <div class="nav-links">
            <strong>星级>=</strong>
            <component
              v-if="starComponent"
              :is="starComponent"
              v-model="rating"
              :star-size="24"
              inline
              :show-rating="false"
              @rating-selected="selectRating"
            />
          </div>
        </div>
        <p>共：{{ filteredList.length }}部</p>
        <div class="grid" ref="grid">
          <div
            class="grid-item"
            v-for="(v, k) in filteredList"
            :key="k"
            :data-watchyear="v.watch_year"
            :data-star="v.star"
          >
            <a href="#" @click.prevent="showMeta(v)">
              <img :src="v.image" referrerpolicy="no-referrer" />
              <div class="star">
                {{ v.name }}<br />{{ '⭐'.repeat(v.star) }}
              </div>
            </a>
          </div>
        </div>
      </div>
      <modal v-if="showModal" @close="showModal = false">
        <div class="movie-meta">
          <h3>
            <a :href="meta.url">{{ meta.name }}</a>
          </h3>
          <hr />
          <p><strong>推荐度: </strong>{{ '⭐'.repeat(meta.star) }}</p>
          <p><strong>评价: </strong><span v-html="meta.comment" /></p>
        </div>
      </modal>
    </template>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
import Modal from '@theme/components/Modal.vue'
import items from '@theme/data/movies.json'

export default {
  components: { ParentLayout, Modal },
  data() {
    return {
      items,
      movieList: [],
      meta: {},
      watchYearOptions: [],
      curYear: null,
      rating: null,
      starComponent: null,
      showModal: false
    }
  },
  computed: {
    filteredList() {
      return this.movieList
        .filter(v => {
          return this.curYear === null ? true : v.watch_year === this.curYear
        })
        .filter(v => {
          return this.rating <= 0 ? true : v.star >= this.rating
        })
    },
    thisYear() {
      return new Date().getFullYear()
    }
  },
  created() {
    import('vue-star-rating').then(module => {
      this.starComponent = module.default
    })
    this.loadData()
  },
  mounted() {
    this.movieList.forEach(e => {
      this.loadImage(e.cover).then(url => {
        e.image = url
      })
    })
  },
  methods: {
    loadData() {
      this.items.forEach(v => {
        v.comment = v.comment.replace(/\n/g, '<br>')
        this.movieList.push({ ...v, comment: v.comment.replace(/\n/g, '<br>'), image: this.$withBase('/static/loading.gif') })
        if (this.watchYearOptions.indexOf(v.watch_year) < 0) {
          this.watchYearOptions.push(v.watch_year)
        }
      })
      this.curYear = this.thisYear
    },
    loadImage(url) {
      return fetch(url, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        referrer: ''
      })
        .then(response => response.blob())
        .then(blob => {
          return new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = function(evt) {
              resolve(evt.target.result)
            }
            reader.readAsDataURL(blob)
          })
        })
    },
    showMeta(meta) {
      this.meta = meta
      this.showModal = true
    },
    selectYear(year) {
      this.curYear = year
    },
    selectRating(rating) {
      this.rating = rating
    }
  }
}
</script>

<style lang="css">
.container {
  max-width: 900px;
  margin: 0 auto;
}
.grid {
  display: flex;
  flex-wrap: wrap;
}

.grid-item {
  width: 50%;
  padding: 0.5rem;
  flex: none;
  box-sizing: border-box;
}

@media (min-width: 992px) {
  .grid-item {
    width: 25%;
  }

  .grid {
    margin: 0 -0.5rem;
  }
}

.grid-item img {
  width: 100%;
  line-height: 1.7;
}

.grid-item a {
  position: relative;
  vertical-align: bottom;
  line-height: 1.7;
}

.grid-item .star {
  position: absolute;
  color: white;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 20px;
  vertical-align: middle;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  padding: 3px;
}

.movie-meta {
  padding: 0.5em 1em;
  color: white;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.filters .nav-link {
  display: inline-block;
}

.vue-star-rating-star {
  position: relative;
  top: 3px;
}
</style>
