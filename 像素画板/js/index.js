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

  //测试
  drawingBoard.value[13][0] = "red"

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

  return {
    height,
    width,
    changeDrawingBoard,
    drawingBoardSize,
    bgDrawingBoard,
    drawingBoard
  }
}
