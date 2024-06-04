function debounce(fn, delay) {
  let timer = null
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

//生成画板
function init(height = 16, width = 16) {
  const arr = []
  for (let i = 0; i < height; i++) {
    arr.push([])
    for (let j = 0; j < width; j++) {
      arr[i].push("#00000000")
    }
  }
  return arr
}

//检测是否有被裁剪
function checkIsCut(drawingBoardArr, height, width) {
  if (drawingBoardArr.length > height) {
    for (let i = height; i < drawingBoardArr.length; i++) {
      if (drawingBoardArr[i].some(cell => cell !== "#00000000")) {
        return true;
      }
    }
  }
  if (drawingBoardArr[0].length > width) {
    for (let i = 0; i < height; i++) {
      for (let j = width; j < drawingBoardArr[0].length; j++) {
        if (drawingBoardArr[i][j] !== "#00000000") {
          return true;
        }
      }
    }
  }
  return false;
}


//更新画板
function updateDrawingBoard(drawingBoardArr, height, width) {
  const res = {
    h: height.value,
    w: width.value,
    arr: [],
  }
  //最大值校验
  if (res.h > height.max) res.h = height.max;
  if (res.w > width.max) res.w = width.max;

  let isDataLoss = checkIsCut(drawingBoardArr, res.h, res.w);
  if (isDataLoss && !confirm(`画布大小为:${res.w}x${res.h}内容将被裁剪，是否继续？`)) {
    res.h = drawingBoardArr.length;
    res.w = drawingBoardArr[0].length;
    return res;
  }

  const arr = init(res.h, res.w);
  // 拷贝画板内容
  for (let i = 0; i < res.h; i++) {
    for (let j = 0; j < res.w; j++) {
      if (drawingBoardArr[i] && drawingBoardArr[i][j] !== undefined) {
        arr[i][j] = drawingBoardArr[i][j];
      } else {
        arr[i][j] = "#00000000";
      }
    }
  }
  res.arr = arr;
  return res;
};

//解析图片文件生成画板内容
function parseImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = Math.min(200 / img.width, 200 / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 将压缩过的图片转换为二维数组，内容是对应的颜色值
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const arr = [];
        const historyRecord = [];

        for (let i = 0; i < canvas.height; i++) {
          arr[i] = [];
          for (let j = 0; j < canvas.width; j++) {
            const index = (i * canvas.width + j) * 4;
            arr[i][j] = `rgb(${data[index]},${data[index + 1]},${data[index + 2]})`;
            historyRecord.push({
              row: i,
              col: j,
              color: arr[i][j]
            });
          }
        }

        // 读取文件名字
        const name = file.name.split('.')[0];
        resolve({
          name,
          height: canvas.height,
          width: canvas.width,
          drawingBoard: arr,
          historyRecord
        });
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
}

const { createApp, ref, reactive, onMounted } = Vue
createApp({
  setup() {
    const height = reactive({
      value: 16,
      max: 0
    })
    const width = reactive({
      value: 16,
      max: 0
    })

    //画板参数
    const drawingBoardSize = reactive({
      width: 16,
      height: 16
    })
    const bgDrawingBoard = ref("#e6e6e6")
    const drawingBoard = ref(init(height.value, width.value));

    //调整画布
    const changeDrawingBoard = () => {
      if (isPlay) return
      const { h, w, arr } = updateDrawingBoard(drawingBoard.value, height, width);
      height.value = h
      width.value = w
      drawingBoardSize.height = h
      drawingBoardSize.width = w
      if (arr.length > 0) drawingBoard.value = arr
    }

    //获取可视区域的宽度和高度
    const getVisibleWH = () => {
      width.max = Math.floor(window.innerWidth / 16) - 1
      if (Math.floor(window.innerHeight / 16) - 5 < 0) {
        height.max = 0
      } else {
        height.max = Math.floor(window.innerHeight / 16) - 5
      }
    }

    //获取本地存储的数据
    const works = ref([])
    const keys = Object.keys(localStorage)
    if (keys.length !== 0) {
      keys.forEach(key => {
        works.value.push(JSON.parse(localStorage.getItem(key)))
      })
    }

    onMounted(() => {
      getVisibleWH()
      //通过防抖计算当前屏幕可视区域的宽度和高度
      const resize = debounce(() => {
        getVisibleWH()
      }, 100)
      window.addEventListener('resize', resize)

      //文件拖放上传
      const app = document.getElementById("app")
      app.addEventListener('dragover', (e) => {
        e.preventDefault()
      })
      app.addEventListener('drop', (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0];
        if (!file) {
          alert('请上传文件');
          return;
        }

        const { type, name } = file;
        if (type.startsWith('image')) {
          parseImageFile(file)
            .then((result) => {
              console.log(result);
              works.value.push(result);
              localStorage.setItem(result.name, JSON.stringify(result));
              selectWork(result);
            })
            .catch((error) => {
              console.error('图片解析失败:', error);
            });
        } else if (type === 'application/json') {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              works.value.push(data);
              localStorage.setItem(data.name, event.target.result);
              selectWork(data);
            } catch (error) {
              alert('无效的JSON文件');
              console.error('JSON解析失败:', error);
            }
          };
          reader.readAsText(file);
        } else alert('请上传json文件或图片文件');
      })
    })

    //当画笔颜色
    const currentColor = ref("#191919")
    const customColor = ref("#e6e6e6")
    const brush = ref(['#191919', '#301504', '#542409', '#eaee57', '#dba213', '#ffffff'])
    // const brush = ref(['#0a0b0d', '#f2d300', '#eaab00', '#e6d302', '#f90316', '#ffffff'])//皮卡丘

    let lastColor = "191919";
    const switchingTool = (tool) => {
      switch (tool) {
        case 'eraser':
          lastColor = currentColor.value
          currentColor.value = "#00000000"
          break;
        case 'brush':
          if (currentColor.value !== "#00000000") return
          currentColor.value = lastColor
          break
        default:
          break;
      }
    }

    //历史纪录
    const historyRecord = {
      height: height.value,
      width: width.value,
      value: []
    }

    //绘画
    const startDarwing = ref(false)
    const start = (e) => {
      startDarwing.value = true
      draw(e)
    }
    let isPlay = false
    const draw = (e) => {
      if (!startDarwing.value || isPlay) return
      const target = e.target
      const row = target.getAttribute('data-row')
      const col = target.getAttribute('data-col')
      drawingBoard.value[row][col] = currentColor.value;

      historyRecord.value.push({ row, col, color: currentColor.value })
    }
    const end = () => {
      startDarwing.value = false
    }

    //重置
    const reset = () => {
      if (isPlay) return
      historyRecord.value = []
      drawingBoard.value = init(height.value, width.value)
    }

    //保存到本地
    const save = (type) => {
      if (isPlay) return
      const name = prompt("请输入你的作品名称")
      if (name === null) return
      const data = JSON.stringify({
        name: name,
        height: height.value,
        width: width.value,
        drawingBoard: drawingBoard.value,
        historyRecord: historyRecord.value
      })
      if (type === 'file') {
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = name + '.json'
        a.click()
        URL.revokeObjectURL(url)
      } else {
        localStorage.setItem(name, data)
        works.value.push(JSON.parse(data))
      }
    }

    const workName = ref();
    const selectWork = (work) => {
      const shouldOverwrite = drawingBoard.value.some(row =>
        row.some(col => col !== "#00000000")
      );
      if (shouldOverwrite && !confirm("是否覆盖当前画布？")) {
        return;
      }
      workName.value = work.name
      height.value = work.height
      width.value = work.width
      drawingBoardSize.height = work.height
      drawingBoardSize.width = work.width
      drawingBoard.value = JSON.parse(JSON.stringify(work.drawingBoard))
      historyRecord.value = JSON.parse(JSON.stringify(work.historyRecord))
    }
    const deleteWork = (work) => {
      works.value = works.value.filter(w => w.name !== work.name)
      localStorage.removeItem(work.name)
    }

    //播放
    const play = () => {
      drawingBoard.value = init(height.value, width.value)
      isPlay = true
      let i = 0
      let batchSize = 1// 每次处理的记录数
      if (drawingBoard.value.length >= 100) batchSize = drawingBoard.value.length
      const playInterval = setInterval(() => {
        if (i >= historyRecord.value.length) {
          isPlay = false
          clearInterval(playInterval)
          return
        }

        for (let j = 0; j < batchSize && i < historyRecord.value.length; j++) {
          const { row, col, color } = historyRecord.value[i]

          if (drawingBoard.value[row] && drawingBoard.value[row][col] !== undefined) {
            drawingBoard.value[row][col] = color
          }
          i++
        }
      }, 1)

    }

    return {
      //画板参数
      height,
      width,
      changeDrawingBoard,
      drawingBoardSize,
      bgDrawingBoard,
      drawingBoard,
      //笔刷
      brush,
      currentColor,
      customColor,
      switchingTool,
      start,
      draw,
      end,
      startDarwing,
      works,
      reset,
      save,
      selectWork,
      deleteWork,
      workName,
      play
    }
  }
}).mount('#app')