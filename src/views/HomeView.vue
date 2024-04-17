<template>
  <canvas id="wanderContainer"></canvas>
</template>

<script setup>
import { onMounted } from "vue";
import { VRWander } from "@/components/vr-wander";

onMounted(() => {
  const vrWander = new VRWander({
    container: document.getElementById("wanderContainer"),
    cameraOption: {
      position: { x: 16.928, y: 2, z: 0.699 },
      lookAt: { x: 30.551, y: 2, z: 1.096 },
    },
  });

  vrWander.loadHall({
    url: "/models/village/scene.gltf",
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    onProgress: (p) => {
      console.log("加载进度", p);
    },
  }).then(gltf=>{
    console.log(gltf,'gltf')
  })
});
</script>
<style>
#wanderContainer {
  width: 100%;
  height: 100%;
  background:url('/bg-village.png') no-repeat center center;
  background-size:100% 100%;
}
</style>
