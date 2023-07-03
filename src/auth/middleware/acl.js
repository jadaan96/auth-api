'use strict';

module.exports = (capability) => {
  console.log(capability)

  return (req, res, next) => {
  console.log("acllllllllllllll",req.user.capabilities)
    try {
      if (req.user.capabilities.includes(capability)) {
        
        next();
      }
      else {
        next('Access Denied');
      }
    } catch (e) {
      next('Invalid Login');
    }

  }

}
