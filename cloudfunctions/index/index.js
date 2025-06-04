const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: 'cloud1-8g1w7r28e2de3747'
});

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取微信上下文信息，包括openid、appid和unionid
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();

  return {
    OPENID,
    APPID,
    UNIONID, // unionid仅在满足获取条件时返回
  };
};