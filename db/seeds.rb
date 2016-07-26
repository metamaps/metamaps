# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

## USERS
User.new(name: 'user',
         email: 'user@user.com',
         password: 'toolsplusconsciousness',
         code: 'qwertyui',
         joinedwithcode: 'qwertyui',
         admin: 'false').save(validate: false)

User.new(name: 'admin',
         email: 'admin@admin.com',
         password: 'toolsplusconsciousness',
         code: 'iuytrewq',
         joinedwithcode: 'iuytrewq',
         admin: 'true').save(validate: false)
## END USERS

## METACODES
Metacode.create(name: 'Action',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_action.png',
                color: '#BD6C85')

Metacode.create(name: 'Activity',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_activity.png',
                color: '#6EBF65')

Metacode.create(name: 'Catalyst',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_catalyst.png',
                color: '#EF8964')

Metacode.create(name: 'Closed',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_closedissue.png',
                color: '#ABB49F')

Metacode.create(name: 'Process',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_process.png',
                color: '#BDB25E')

Metacode.create(name: 'Future',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_futuredev.png',
                color: '#25A17F')

Metacode.create(name: 'Group',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_group.png',
                color: '#7076BC')

Metacode.create(name: 'Implication',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_implication.png',
                color: '#83DECA')

Metacode.create(name: 'Insight',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_insight.png',
                color: '#B074AD')

Metacode.create(name: 'Intention',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_intention.png',
                color: '#BAEAFF')

Metacode.create(name: 'Knowledge',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_knowledge.png',
                color: '#60ACF7')

Metacode.create(name: 'Location',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_location.png',
                color: '#ABD9A7')

Metacode.create(name: 'Need',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_need.png',
                color: '#D2A7D4')

Metacode.create(name: 'Open',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_openissue.png',
                color: '#9BBF71')

Metacode.create(name: 'Opportunity',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_opportunity.png',
                color: '#889F64')

Metacode.create(name: 'Person',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_person.png',
                color: '#DE925F')

Metacode.create(name: 'Platform',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_platform.png',
                color: '#21C8FE')

Metacode.create(name: 'Problem',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_problem.png',
                color: '#99CFC4')

Metacode.create(name: 'Resource',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_resource.png',
                color: '#C98C63')

Metacode.create(name: 'Role',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_role.png',
                color: '#A8595D')

Metacode.create(name: 'Task',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_task.png',
                color: '#3397C4')

Metacode.create(name: 'Trajectory',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_trajectory.png',
                color: '#D3AA4C')

Metacode.create(name: 'Argument',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_argument.png',
                color: '#7FAEFD')

Metacode.create(name: 'Con',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_con.png',
                color: '#CF7C74')

Metacode.create(name: 'Subject',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_subject.png',
                color: '#8293D8')

Metacode.create(name: 'Decision',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_decision.png',
                color: '#CCA866')

Metacode.create(name: 'Event',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_event.png',
                color: '#F5854B')

Metacode.create(name: 'Example',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_example.png',
                color: '#618C61')

Metacode.create(name: 'Experience',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_experience.png',
                color: '#BE995F')

Metacode.create(name: 'Feedback',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_feedback.png',
                color: '#54A19D')

Metacode.create(name: 'Aim',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_aim.png',
                color: '#B0B0B0')

Metacode.create(name: 'Good',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_goodpractice.png',
                color: '#BD9E86')

Metacode.create(name: 'Idea',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_idea.png',
                color: '#C4BC5E')

Metacode.create(name: 'List',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_list.png',
                color: '#B7A499')

Metacode.create(name: 'Media',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_media.png',
                color: '#6D94CC')

Metacode.create(name: 'Metamap',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_metamap.png',
                color: '#AEA9FD')

Metacode.create(name: 'Model',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_model.png',
                color: '#B385BA')

Metacode.create(name: 'Note',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_note.png',
                color: '#A389A1')

Metacode.create(name: 'Perspective',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_perspective.png',
                color: '#2EB6CC')

Metacode.create(name: 'Pro',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_pro.png',
                color: '#89B879')

Metacode.create(name: 'Project',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_project.png',
                color: '#85A050')

Metacode.create(name: 'Question',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_question.png',
                color: '#5CB3B3')

Metacode.create(name: 'Reference',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_reference.png',
                color: '#A7A7A7')

Metacode.create(name: 'Research',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_research.png',
                color: '#CD8E89')

Metacode.create(name: 'Status',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_status.png',
                color: '#EFA7C0')

Metacode.create(name: 'Tool',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_tool.png',
                color: '#828282')

Metacode.create(name: 'Wildcard',
                manual_icon: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_wildcard.png',
                color: '#73C7DE')
## END METACODES
