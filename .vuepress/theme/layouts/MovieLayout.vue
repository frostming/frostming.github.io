<template>
<ParentLayout>
  <template #page-bottom>
    <div class="container">
      <div class="grid">
        <div
          class="grid-item"
          v-for="(v, k) in movieList"
          :key="k"
          :data-pubyear="v.pub_year"
          :data-watchyear="v.watch_year"
          :data-star="v.star"
        >
          <a href="#">
            <img :src="v.cover" referrerpolicy="no-referrer">
            <div class="star">{{ v.name }}<br>{{ '⭐'.repeat(v.star) }}</div>
          </a>
        </div>
      </div>
    </div>
  </template>
</ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'

export default {
  components: { ParentLayout },
  data() {
    return {
      movieList: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$frontmatter.data.forEach(v => {
        this.loadImage(v.cover).then(blob => {
          this.movieList.push({ ...v, cover: blob })
        })
      })
    },
    loadImage(url) {
      return fetch(url, {
          method: "GET",
          mode: "cors",
          redirect: "follow",
          referrer: ""
      }).then(response => response.blob()).then(blob => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = function(evt) {
            resolve(evt.target.result)
          }
          reader.readAsDataURL(blob)
        })
      })
    }
  }
}
</script>

<style lang="css" scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
}
.grid {
  display: flex;
  margin: 0 -0.5rem;
  flex-wrap: wrap;
}

.grid-item {
  width: 25%;
  padding: 0.5rem;
  flex: none;
  box-sizing: border-box;
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
  height: 46px;
  line-height: 20px;
  vertical-align: middle;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  padding: 3px;
}

</style>
