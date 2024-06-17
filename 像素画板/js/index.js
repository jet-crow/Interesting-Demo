const { ref, reactive, onMounted } = Vue
import { debounce, init, updateDrawingBoard, parseImageFile } from './utills.js'

export function useDrawingBoard() {
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
  // const brush = ref(['#191919', '#301504', '#542409', '#eaee57', '#dba213', '#ffffff'])
  const brush = ref(['#040203', '#fd564e', '#ef7870', '#fca7a7', '#f37670', '#45a3fb','#f8de27','#fb120b'])
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
