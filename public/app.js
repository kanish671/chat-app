(() => {
  let socket = io();
  const join = document.getElementById('join');
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const users = document.getElementById('users');
  const messages = document.getElementById('user-messages');
  const send = document.getElementById('send');
  const name = document.getElementById('name');

  const userClick = (e) => {
    e.currentTarget.classList.remove('pending');
    const to = e.currentTarget.textContent;
    const from = name.value;
    const arr = [from, to];
    arr.sort();
    const room = arr.join('-');
    socket.emit('join room', { room: room, from, to });
    messages.innerHTML = '';
    send.removeAttribute('disabled');
    messages.setAttribute('data-room', room);
  }

  join.addEventListener('click', () => {
    socket.emit('join', { name: name.value });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value;
    const from = name.value;
    const room = messages.getAttribute('data-room');
    if(message) {
      let item = document.createElement('li');
      item.textContent = message;
      messages.appendChild(item);
      socket.emit('chat message', { from, room, message });
      input.value = '';
    }
  });
  
  socket.on('chat message', (data) => {
    let item = document.createElement('li');
    item.textContent = `${data.from}: ${data.message}`;
    if(messages.getAttribute('data-room') === data.room) {
      messages.appendChild(item);
    }
    else {
      users.getElementsByClassName(data.from)[0].classList.add('pending');
    }
  });

  socket.on('user joined', (data) => {
    users.innerHTML = '';
    data.users.forEach(u => {
      if(u === name.value) {
        return
      }
      let item = document.createElement('div');
      item.className = `user ${u}`;
      item.textContent = u;
      item.onclick = userClick;
      users.appendChild(item);  
    });
  });

  socket.on('room contents', (data) => {
    data.forEach(d => {
      let item = document.createElement('li');
      item.textContent = d;
      messages.appendChild(item);
    });
    // let item = document.createElement('li');
    // item.textContent = `${data.from}: ${data.message}`;
    // if(messages.getAttribute('data-room') === data.room) {
    //   messages.appendChild(item);
    // }
    // else {
    //   users.getElementsByClassName(data.from)[0].classList.add('pending');
    // }
  });
})();