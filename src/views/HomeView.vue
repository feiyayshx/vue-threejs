<template>
  <canvas id="wanderContainer"></canvas>
</template>

<script setup>
import { onMounted } from "vue";
import { VRWander } from "@/components/vr-wander/index";

onMounted(() => {

  const vrWander = new VRWander({
    container: document.getElementById("wanderContainer"),
    debugger: true,
    maxSize: 2,
    cameraOption: {
      position: { x: 16.928, y: 2, z: 0.699 },
      lookAt: { x: 30.551, y: 2, z: 1.096 },
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

  vrWander.loadImages([
    {
      id: "1",
      url: "/models/images/s1.jpg",
      name: "宫崎骏AI",
      desc: "宫崎骏AI绘画",
      scale: { x: 0.8, y: 0.8, z: 0.8 },
      position: { x: -2.64, y: 1.29, z:-2.9 },
      view: { x: 24.011, y: 2.1, z: 4.379 },
      rotation: { x: 0, y: 0, z: 0 },
      type: "picture",
    },
    {
      id: "2",
      url: "/models/images/c1.jpg",
      name: "猫人",
      desc: "信息描述",
      scale: { x: 0.8, y: 0.8, z: 0.8 },
      position: { x: 0, y: 1, z:0},
      view: { x: 24.011, y: 2.1, z: 4.379 },
      rotation: { x: 0, y: 0, z: 0 },
      type: "picture",
    }
  ])
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
