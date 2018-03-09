import React from 'react'
import { Route, IndexRoute, Redirect } from 'react-router'
import App from './App'
import Apps from './Apps'
import Maps from './Maps'
import MapView from './MapView'
import Metacodes from './Admin/Metacodes'
import NewMetacode from './Admin/NewMetacode'
import EditMetacode from './Admin/EditMetacode'
import MetacodeSets from './Admin/MetacodeSets'
import NewMetacodeSet from './Admin/NewMetacodeSet'
import EditMetacodeSet from './Admin/EditMetacodeSet'
import Notifications from './Notifications/Notifications'
import NotificationPage from './Notifications/NotificationPage'
import TopicView from './TopicView'
import LoggedOutHome from './LoggedOutHome'
import RequestAccess from './RequestAccess'
import RequestInvite from './RequestInvite'
import Login from './Login'
import Join from './Join'
import UserSettings from './UserSettings'

function nullComponent(props) {
  return null
}

export default function makeRoutes (currentUser) {
  const homeComponent = currentUser && currentUser.id ? Maps : LoggedOutHome
  return <Route path="/" component={App} >
    <IndexRoute component={homeComponent} />
    <Route path="explore">
      <Route path="active" component={Maps} />
      <Route path="featured" component={Maps} />
      <Route path="mine" component={Maps} />
      <Route path="shared" component={Maps} />
      <Route path="starred" component={Maps} />
      <Route path="mapper/:id" component={Maps} />
    </Route>
    <Route path="maps/:id">
      <IndexRoute component={MapView} />
      <Route path="request_access" component={RequestAccess} />
    </Route>
    <Route path="topics/:id" component={TopicView} />
    {!currentUser && <Route path="login" component={Login} />}
    {!currentUser && <Route path="join" component={Join} />}
    {!currentUser && <Route path="request" component={RequestInvite} />}
    {currentUser && <Redirect path="login" to="/" />}
    {currentUser && <Redirect path="join" to="/" />}
    {currentUser && <Redirect path="request" to="/" />}
    <Route path="notifications">
      <IndexRoute component={Notifications} />
      <Route path=":id" component={NotificationPage} />
    </Route>
    <Route path="users">
      <Route path=":id/edit" component={UserSettings} />
      <Route path="password" component={nullComponent} />
      <Route path="password/new" component={nullComponent} />
      <Route path="password/edit" component={nullComponent} />
    </Route>
    <Route path="metacodes">
      <IndexRoute component={Metacodes} />
      <Route path="new" component={NewMetacode} />
      <Route path=":id/edit" component={EditMetacode} />
    </Route>
    <Route path="metacode_sets">
      <IndexRoute component={MetacodeSets} />
      <Route path="new" component={NewMetacodeSet} />
      <Route path=":id/edit" component={EditMetacodeSet} />
    </Route>
    <Route path="oauth">
      <Route path="token/info" component={Apps} />
      <Route path="authorize">
        <IndexRoute component={nullComponent} />
        <Route path=":code" component={nullComponent} />
      </Route>
      <Route path="authorized_applications">
        <IndexRoute component={Apps} />
        <Route path=":id" component={Apps} />
      </Route>
      <Route path="applications">
        <IndexRoute component={Apps} />
        <Route path="new" component={Apps} />
        <Route path=":id" component={Apps} />
        <Route path=":id/edit" component={Apps} />
      </Route>
    </Route>
  </Route>
}
