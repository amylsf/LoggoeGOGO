import React from 'react';
import { ItemTypes } from '../../constants.js';
import { DropTarget } from 'react-dnd';

const deleteSource = {
  drop(props, monitor) {
    let item = monitor.getItem();
    props.deleteVideo(item.item);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
  }
}

class Hidden extends React.Component {

  render() {
    const { connectDropTarget } = this.props;
    return connectDropTarget(
      <div style={hidden}></div>
    )
  }
}

const hidden = {
  float: 'left',
  height: '80vh',
  width: '18%'
}

export default DropTarget(ItemTypes.SAVED, deleteSource, collect)(Hidden);