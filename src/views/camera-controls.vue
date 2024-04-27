<template>
  <div class="camera-control">
    <canvas id="controlContainer"></canvas>
    <div class="btns-group">
      <el-button type="primary" plain @click="onMoveTo">moveTo</el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { VRWander } from "@/components/vr-wander/controls.js";

let wanderInstance = null

onMounted(() => {

  wanderInstance = new VRWander({
    container: document.getElementById("controlContainer"),
    // cameraOption: {
    //   position: { x: 16.928, y: 2, z: 0.699 },
    //   lookAt: { x: 30.551, y: 2, z: 1.096 },
    // },
  });

});

const onMoveTo = (event) => {
  if(!wanderInstance) return
  wanderInstance.moveToEvent(event)
}

</script>
<style type="css">
.camera-control {
  width: 100vw;
  height: 100vh;
  position: relative;
}
#controlContainer {
  width: 100%;
  height: 100%;
  /* background:url('/bg-village.png') no-repeat center center;
  background-size:100% 100%; */
}

.btns-group {
  width:300px;
  position: absolute;
  left: 16px;
  top:16px;
  display:flex;
  flex-flow: row wrap;
}

</style>
