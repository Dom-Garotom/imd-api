'use strict';




/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Produtos", "tags", {
      type: Sequelize.TEXT
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Produtos", "tags");
  }
};
