module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_user_room', (userId) => {
      socket.join('user_' + userId);
    });
    socket.on('join_wallet_room', (walletAddress) => {
      socket.join('wallet_' + walletAddress);
    });
    socket.on('disconnect', () => {});
  });
};
