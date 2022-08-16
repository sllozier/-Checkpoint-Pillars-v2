const Sequelize = require('sequelize');
const db = require('./db');
const { DataTypes } = require('sequelize');

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  userType: {
    type: Sequelize.TEXT,
    defaultValue: 'STUDENT',
    allowNull: false,
    validate: {
      isIn: [['STUDENT', 'TEACHER']]
    }
  },
  isStudent:{
    type: DataTypes.VIRTUAL,
    get(){
      if(`${this.userType}` === 'STUDENT'){
        return true
      } else {
        return false
      }
    }
  },
  isTeacher:{
    type: DataTypes.VIRTUAL,
    get(){
      if(`${this.userType}` === 'TEACHER'){
        return true
      } else {
        return false
      }
    }
  }
});

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

User.findUnassignedStudents = async function(){
  return await this.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: null
    }
  })
};

User.findTeachersAndMentees = async function (){
  return await this.findAll({
    include: {
      model: User,
      as: 'mentees'
    },
    where: {
      userType: 'TEACHER'
    }
  })
};
//^^^^ returns all teachers assinged mentees in an array.

User.prototype.getPeers = async function (){
    return await User.findAll({
      where: {
        mentorId: this.mentorId,
        id: {
          [Sequelize.Op.not]: this.id
        }
      }
    });
  }
//^^^^ returns all that have the same mentor id and the id is not the same as their id.
//meaning they are students.

User.beforeUpdate(async(person) => {
  const mentor = await User.findByPk(person.mentorId);
   const mentees = await User.findAll({
    where: {
      mentorId: person.id
    }
   });
   if(mentor && mentor.userType === 'STUDENT'){
    console.log('FIRST')
    return Promise.reject(
      new Error('This is not a Teacher, silly! This is a student!')
    );
   } else if (mentor && person.userType === 'TEACHER'){
    console.log('SECOND')
    return Promise.reject(
      new Error('This student has a teacher, they cannot be a teacher.')
    );
   }else if (mentees.length && person.userType === 'STUDENT'){
    console.log('THIRD')
    return Promise.reject(
      new Error('This teacher has a student, they cannot be a student.')
    );
   }
});
//^^^^ Okie-dokie, so grab that mentorId because that is a mentor!
//findall where the id is a person.id not a mentorId - this is a student!
//if person isn't a teacher, they can't be a mentor and Promise.reject with 
//Error message. If user has a mentor and that mentor is a teacher, reject.
//If there are mentees(not empty array), and that mentee is a student, reject.


module.exports = User;
