const card = document.getElementById("card")

function barHeight() {
  return window.outerHeight - window.innerHeight;
}

//内容转视口坐标
function clientToScreen(x, y) {
  return {
    x: x + window.screenX,
    y: y + window.screenY + barHeight()
  }
}

//视口转内容坐标
function screenToClient(x, y) {
  return {
    x: x - window.screenX,
    y: y - window.screenY - barHeight()
  }
}

const channel = new BroadcastChannel('card')
channel.onmessage = (e) => {
  const { x, y } = screenToClient(e.data.x, e.data.y);
  card.style.left = x + 'px';
  card.style.top = y + 'px';
}

card.onmousedown = (e) => {
  let x = e.pageX - card.offsetLeft;
  let y = e.pageY - card.offsetTop;
  window.onmousemove = (e) => {
    const cx = e.pageX - x;
    const cy = e.pageY - y;
    card.style.left = cx + 'px';
    card.style.top = cy + 'px';
    const points = clientToScreen(cx, cy);
    channel.postMessage(points);
  }
  window.onmouseup = () => {
    window.onmousemove = null;
    window.onmouseup = null;
  }
}

function init() {
  const url = new URL(location.href)
  const type = url.searchParams.get('type') || 'Q'
  card.src = `./img/${type}.png`
}
init()