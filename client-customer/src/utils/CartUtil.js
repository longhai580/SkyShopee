const CartUtil = {
  getTotal(mycart) {
    let total = 0;
    for (const item of mycart) {
      total += item.product.price * item.quantity;
    }
    return total;
  },
  getCount(mycart) {
    return mycart.reduce((sum, item) => sum + item.quantity, 0);
  }
};
export default CartUtil;
