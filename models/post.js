module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
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
      // nick 추가
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      price: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      account: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      likeCount: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
    },
    
    {
      timestamps: true,
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    )
  );