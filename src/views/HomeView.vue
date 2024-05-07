<template>
  <canvas id="wanderContainer"></canvas>
</template>

<script setup>
import { onMounted } from "vue";
import { VRWander } from "@/components/vr-wander/index";
import { dataImages } from "./data";

onMounted(() => {

  const vrWander = new VRWander({
    container: document.getElementById("wanderContainer"),
    debugger: true,
    maxSize: 2,
    movieHight:2,
    cameraOption: {
      position: { x: 6.928, y: 2, z: 0.699 },
      lookAt: { x:-0.028, y:1, z:0 },
    },
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
});

</script>
<style type="css">
#wanderContainer {
  width: 100%;
  height: 100%;
  /* background:url('/bg-village.png') no-repeat center center;
  background-size:100% 100%; */
}
</style>
