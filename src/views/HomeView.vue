<template>
  <canvas id="wanderContainer"></canvas>
  <!-- 画面详情 -->
  <div v-if="showImageDetail" class="image-block">
    <div class="close-text" @click="onClose">关闭</div>
    <div class="image-detail">
      <div class="text">
        <p style="font-weight: bold;">{{ currentImage.name }}</p>
        <p>{{ currentImage.desc }}</p>
      </div>
      <img class="img-cont" :src="currentImage.url" alt="">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { VRWander } from "@/components/vr-wander/index";
import { dataImages,dataVideos } from "./data";

const showImageDetail = ref(false)
const currentImage = ref({
    url: "/models/images/s1.jpg",
    name: "宫崎骏AI",
    desc: "宫崎骏AI绘画",
    type: "picture",
})

const onClose = () => {
  showImageDetail.value = false
}

onMounted(() => {

  const vrWander = new VRWander({
    container: document.getElementById("wanderContainer"),
    debugger: false,
    maxSize: 2,
    movieHight:2,
    cameraOption: {
      position: { x: 6.928, y: 2, z: 0.699 },
      lookAt: { x:-0.028, y:1, z:0 },
    },
    onClick: (item) => {
      // currentImage.value = item
      // showImageDetail.value = true
    }
  });

  vrWander.loadHall({
    url: "/models/room1/msg.gltf",
    planeName: "meishu01",
    position: { x: 2, y: -0.2, z: 2 },
    scale: 1,
    onProgress: (p) => {
      console.log("加载进度", p);
    },
  }).then(gltf=>{
    console.log(gltf,'gltf')
  })

  vrWander.loadImages(dataImages)
  vrWander.loadVideos(dataVideos)
});

</script>
<style type="css">
#wanderContainer {
  width: 100%;
  height: 100%;
  /* background:url('/bg-village.png') no-repeat center center;
  background-size:100% 100%; */
}

.image-block {
  width: 60%;
  height: 70%;
  position: fixed;
  left:50%;
  top: 50%;
  background:#ffffff;
  padding:20px;
  border-radius: 2%;
  transform: translate(-50%, -50%);
}
.close-text {
  font-size: 16px;
  color:#333333;
  height:30px;
  margin-bottom:10px;
  border-bottom:1px solid #eeeeee;
  text-align:right;
  cursor:pointer;
}
.image-detail {
  display:flex;
  justify-content: space-between;
  height: 90%;

}
.text {
  flex:1;
  color:#333333;
  font-size:16px;
}
.img-cont {
  width: 70%;
}
</style>
