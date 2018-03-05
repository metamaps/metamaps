import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className='centerContent'>
    <br />
    <table>
      <tr>
        <th>Name</th>
        <th className='metacodeSetsDescription'>Description</th>
        <th>Metacodes</th>
      </tr>

    { @metacode_sets.each do |metacode_set| }
      <tr>
        <td>
          { metacode_set.name }<br />
          { link_to 'Edit',
              edit_metacode_set_path(metacode_set) }
          <br />
          { link_to 'Delete',
              metacode_set, method: :delete,
              data: { confirm: 'Are you sure?' } }
        </td>
        <td className='metacodeSetDesc'>{ metacode_set.desc }</td>
        <td>
          { metacode_set.metacodes.each_with_index do |metacode, index| }
            <img className='metacodeSetImage' src='{ asset_path metacode.icon }' />
            { if (index+1)%4 == 0 }
            <div className='clearfloat'></div>
            { end }
          { end }
          <div className='clearfloat'></div>
        </td>
      </tr>
    { end }
    </table>
  </div>
</div>
    )
  }
}

export default MyComponent
