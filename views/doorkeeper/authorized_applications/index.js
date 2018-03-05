import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
<div className="centerContent">
<header className="page-header">
  <h2>{ t('doorkeeper.authorized_applications.index.title') }</h2>
</header>

<main role="main">
  <div>
    Coming soon!<br />
    There are a number of apps being worked on for Metamaps currently, including the playful Metamapper Slack Bot. Check back here for updates.<br />
    If you're a developer interested in building an app for Metamaps, check out <a href="https://metamaps.cc/api" target="_blank">the API docs</a>.
  </div><br />
  { if @applications.count > 0 }
  <table className="table table-striped">
    <thead>
    <tr>
      <th>{ t('doorkeeper.authorized_applications.index.application') }</th>
      <th>{ t('doorkeeper.authorized_applications.index.created_at') }</th>
      <th></th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    { @applications.each do |application| }
      <tr>
        <td>{ application.name }</td>
        <td>{ application.created_at.strftime(t('doorkeeper.authorized_applications.index.date_format')) }</td>
        <td>{ render 'delete_form', application: application }</td>
      </tr>
    { end }
    </tbody>
  </table>
  { end }
</main>
</div>
</div>
    )
  }
}

export default MyComponent
{ render 'script' }
