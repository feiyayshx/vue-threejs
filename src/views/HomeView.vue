<template>
  <canvas id="wanderContainer"></canvas>
</template>

<script setup>
import { onMounted } from "vue";
import { VRWander } from "@/components/vr-wander";

onMounted(() => {
  const vrWander = new VRWander({
    container: document.getElementById("wanderContainer"),
  });
  vrWander
    .loadGLTF({
      url: "./models/room2/dm.glb",
      planeName: "dm", // plane , meishu01
      // position: { x: 2, y: -0.2, z: 2 },
      position: { x: 0, y: 0, z: 0 },
      scale: 1,
      onProgress: (p) => {
        console.log("加载进度", p);
      },
    })
    .then((gltf) => {
      console.log(gltf, "gltf");
    });
});
</script>
<style>
#wanderContainer {
  width: 100%;
  height: 100%;
}
</style>
