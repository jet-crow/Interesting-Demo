const { ref, reactive, watch, onMounted, computed } = Vue
import { debounce, init, updateDrawingBoard } from './utills.js'

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
  onMounted(() => {
    getVisibleWH()
    //通过防抖计算当前屏幕可视区域的宽度和高度
    const resize = debounce(() => {
      getVisibleWH()
    }, 100)
    window.addEventListener('resize', resize)
  })

  //当画笔颜色
  const currentColor = ref("#191919")
  const customColor = ref("#e6e6e6")
  const brush = ref(['#191919', '#301504', '#542409', '#eaee57', '#dba213', '#ffffff'])

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

  //绘画
  const startDarwing = ref(false)
  const start = (e) => {
    startDarwing.value = true
    const target = e.target
    const row = target.getAttribute('data-row')
    const col = target.getAttribute('data-col')
    drawingBoard.value[row][col] = currentColor.value;
  }
  const draw = (e) => {
    if (!startDarwing.value) return
    //拿到对应的元素
    const target = e.target
    const row = target.getAttribute('data-row')
    const col = target.getAttribute('data-col')
    drawingBoard.value[row][col] = currentColor.value;
  }
  const end = () => {
    startDarwing.value = false
  }

  const reset = () => {
    drawingBoard.value = init(height.value, width.value)
  }
  return {
    height,
    width,
    changeDrawingBoard,
    drawingBoardSize,
    bgDrawingBoard,
    drawingBoard,
    brush,
    currentColor,
    customColor,
    switchingTool,
    start,
    draw,
    end,
    startDarwing,
    reset
  }
}
