module.exports = (sequelize, DataTypes) => (
    sequelize.define('scrap', {
      title: {
        type: DataTypes.STRING(140),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(140),
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    }, {
      timestamps: true,
      paranoid: true,
      charset: 'utf8',
    collate: 'utf8_general_ci',

    })
  );