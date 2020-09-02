'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  async log() {
    console.log('----post---/log')
    const { ctx } = this;
    ctx.body = {
      ret: 1
    };
  }
}

module.exports = HomeController;
