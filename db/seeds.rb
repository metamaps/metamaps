# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
# Read about fixtures at http://api.rubyonrails.org/classes/ActiveRecord/Fixtures.html

## USERS

User.create({
  name: 'user',
  email: 'user@user.com',
  password: 'toolsplusconsciousness',
  code: 'qwertyui',
  joinedwithcode: 'qwertyui',
  admin: 'false',
})

User.create({
  name: 'admin',
  email: 'admin@admin.com',
  password: 'toolsplusconsciousness',
  code: 'iuytrewq',
  joinedwithcode: 'iuytrewq',
  admin: 'true',
})

## METACODES
Metacode.create({
  name: 'Action',
  icon: '/assets/icons/blueprint_96px/bp_action.png',
  color: '#BD6C85',
})

Metacode.create({
  name: 'Activity',
  icon: '/assets/icons/blueprint_96px/bp_activity.png',
  color: '#6EBF65',
})

Metacode.create({
  name: 'Catalyst',
  icon: '/assets/icons/blueprint_96px/bp_catalyst.png',
  color: '#EF8964',
})

Metacode.create({
  name: 'Closed',
  icon: '/assets/icons/blueprint_96px/bp_closedissue.png',
  color: '#ABB49F',
})

Metacode.create({
  name: 'Process',
  icon: '/assets/icons/blueprint_96px/bp_process.png',
  color: '#BDB25E',
})

Metacode.create({
  name: 'Future Dev',
  icon: '/assets/icons/blueprint_96px/bp_futuredev.png',
  color: '#25A17F',
})

Metacode.create({
  name: 'Group',
  icon: '/assets/icons/blueprint_96px/bp_group.png',
  color: '#7076BC',
})

Metacode.create({
  name: 'Implication',
  icon: '/assets/icons/blueprint_96px/bp_implication.png',
  color: '#83DECA',
})

Metacode.create({
  name: 'Insight',
  icon: '/assets/icons/blueprint_96px/bp_insight.png',
  color: '#B074AD',
})

Metacode.create({
  name: 'Intention',
  icon: '/assets/icons/blueprint_96px/bp_intention.png',
  color: '#BAEAFF',
})

Metacode.create({
  name: 'Knowledge',
  icon: '/assets/icons/blueprint_96px/bp_knowledge.png',
  color: '#60ACF7',
})

Metacode.create({
  name: 'Location',
  icon: '/assets/icons/blueprint_96px/bp_location.png',
  color: '#ABD9A7',
})

Metacode.create({
  name: 'Need ',
  icon: '/assets/icons/blueprint_96px/bp_need.png',
  color: '#D2A7D4',
})

Metacode.create({
  name: 'Open Issue',
  icon: '/assets/icons/blueprint_96px/bp_openissue.png',
  color: '#9BBF71',
})

Metacode.create({
  name: 'Opportunity',
  icon: '/assets/icons/blueprint_96px/bp_opportunity.png',
  color: '#889F64',
})

Metacode.create({
  name: 'Person',
  icon: '/assets/icons/blueprint_96px/bp_person.png',
  color: '#DE925F',
})

Metacode.create({
  name: 'Platform',
  icon: '/assets/icons/blueprint_96px/bp_platform.png',
  color: '#21C8FE',
})

Metacode.create({
  name: 'Problem',
  icon: '/assets/icons/blueprint_96px/bp_problem.png',
  color: '#99CFC4',
})

Metacode.create({
  name: 'Resource',
  icon: '/assets/icons/blueprint_96px/bp_resource.png',
  color: '#C98C63 ',
})

Metacode.create({
  name: 'Role',
  icon: '/assets/icons/blueprint_96px/bp_role.png',
  color: '#A8595D',
})

Metacode.create({
  name: 'Task',
  icon: '/assets/icons/blueprint_96px/bp_task.png',
  color: '#3397C4',
})

Metacode.create({
  name: 'Trajectory',
  icon: '/assets/icons/blueprint_96px/bp_trajectory.png',
  color: '#D3AA4C',
})

Metacode.create({
  name: 'Argument',
  icon: '/assets/icons/generics_96px/gen_argument.png',
  color: '#7FAEFD',
})

Metacode.create({
  name: 'Con',
  icon: '/assets/icons/generics_96px/gen_con.png',
  color: '#CF7C74',
})

Metacode.create({
  name: 'Subject',
  icon: '/assets/icons/generics_96px/gen_subject.png',
  color: '#8293D8',
})

Metacode.create({
  name: 'Decision',
  icon: '/assets/icons/generics_96px/gen_decision.png',
  color: '#CCA866',
})

Metacode.create({
  name: 'Event ',
  icon: '/assets/icons/generics_96px/gen_event.png',
  color: '#F5854B',
})

Metacode.create({
  name: 'Example',
  icon: '/assets/icons/generics_96px/gen_example.png',
  color: '#618C61',
})

Metacode.create({
  name: 'Experience',
  icon: '/assets/icons/generics_96px/gen_experience.png',
  color: '#BE995F',
})

Metacode.create({
  name: 'Feedback',
  icon: '/assets/icons/generics_96px/gen_feedback.png',
  color: '#54A19D',
})

Metacode.create({
  name: 'Aim',
  icon: '/assets/icons/generics_96px/gen_aim.png',
  color: '#B0B0B0',
})

Metacode.create({
  name: 'Good Practice',
  icon: '/assets/icons/generics_96px/gen_goodpractice.png',
  color: '#BD9E86',
})

Metacode.create({
  name: 'Idea',
  icon: '/assets/icons/generics_96px/gen_idea.png',
  color: '#C4BC5E',
})

Metacode.create({
  name: 'List',
  icon: '/assets/icons/generics_96px/gen_list.png',
  color: '#B7A499',
})

Metacode.create({
  name: 'Media',
  icon: '/assets/icons/generics_96px/gen_media.png',
  color: '#6D94CC',
})

Metacode.create({
  name: 'Metamap',
  icon: '/assets/icons/generics_96px/gen_metamap.png',
  color: '#AEA9FD',
})

Metacode.create({
  name: 'Model',
  icon: '/assets/icons/generics_96px/gen_model.png',
  color: '#B385BA',
})

Metacode.create({
  name: 'Note',
  icon: '/assets/icons/generics_96px/gen_note.png',
  color: '#A389A1',
})

Metacode.create({
  name: 'Perspective',
  icon: '/assets/icons/generics_96px/gen_perspective.png',
  color: '#2EB6CC',
})

Metacode.create({
  name: 'Pro',
  icon: '/assets/icons/generics_96px/gen_pro.png',
  color: '#89B879',
})

Metacode.create({
  name: 'Project',
  icon: '/assets/icons/generics_96px/gen_project.png',
  color: '#85A050',
})

Metacode.create({
  name: 'Question',
  icon: '/assets/icons/generics_96px/gen_question.png',
  color: '#5CB3B3',
})

Metacode.create({
  name: 'Reference',
  icon: '/assets/icons/generics_96px/gen_reference.png',
  color: '#A7A7A7',
})

Metacode.create({
  name: 'Research',
  icon: '/assets/icons/generics_96px/gen_research.png',
  color: '#CD8E89',
})

Metacode.create({
  name: 'Status update',
  icon: '/assets/icons/generics_96px/gen_status.png',
  color: '#EFA7C0',
})

Metacode.create({
  name: 'Tool',
  icon: '/assets/icons/generics_96px/gen_tool.png ',
  color: '#828282',
})

Metacode.create({
  name: 'Wildcard',
  icon: '/assets/icons/generics_96px/gen_wildcard.png',
  color: '#73C7DE',
})
