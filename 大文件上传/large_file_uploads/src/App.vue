<template>
  <input type="file" @change="fileChange" />
</template>

<script setup>
import { ref } from "vue";
import SparkMD5 from "spark-md5";
const fileList = ref([]);
const file = ref([]);
const fileChange = (e) => {
  console.log(e.target.files[0]);
  //分片
  file.value = e.target.files[0];
  for (let i = 0; i < file.value.size; i += 1024 * 1024) {
    fileList.value.push(file.value.slice(i, i + 1024 * 1024));
  }
};

const fileMd5 = ref("");
const hash = new SparkMD5.ArrayBuffer(); // 构建hash值对象
const fileReader = new FileReader();
fileReader.onload = () => {
  hash.append(fileReader.result);
  fileMd5.value = hash.end();
};
fileReader.readAsArrayBuffer(file.value);

//分片上传
const upload = async (index) => {
  if (index == fileList.value.length) {
    mergeUpload();
    return;
  }
  const formData = new FormData();
  formData.append("chunk", fileList.value[index]);
  formData.append("index", index);
  formData.append("name", fileMd5.value + "@" + index); // 临时的二进制文件分片
  formData.append("filename", fileMd5.value); // 文件名，采用hash
  let res = await http.post("/api/upload_chunk1", formData);
  if (res.code == 200) {
    upload(index + 1);
  } else {
    upload(index); // 失败重新上传
  }
};

//合并分片

const mergeUpload = async () => {
  //合并请求
  let res = await http.post("/api/merge_chunk", {
    filename: fileMd5.value, //最后合并的文件名
    extname: file.value.type.split("/").pop(), //文件后缀
  });
  if ((res.code = 200)) {
    file.value = null;
    fileList.value = [];
    fileMd5.value = "";
    ElMessage({
      type: "success",
      message: "上传成功",
    });
  }
};
</script>
