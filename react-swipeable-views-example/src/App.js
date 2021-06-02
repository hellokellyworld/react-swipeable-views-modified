import React from 'react';
import Button from '@material-ui/core/Button';
import SwipeableViews from './local-react-swipeable-views/packages/react-swipeable-views/src/index';
import {virtualize,bindKeyboard} from './local-react-swipeable-views/packages/react-swipeable-views/utils/index'
import {mod} from './local-react-swipeable-views/packages/react-swipeable-views/core/index';
const VirtualizeSwipeableViews = virtualize(SwipeableViews);


const styles = {
  slide: {
    padding: 15,
    minHeight: 100,
    color: '#fff',
  },
  slide1: {
    backgroundColor: '#FEA900',
  },
  slide2: {
    backgroundColor: '#B3DC4A',
  },
  slide3: {
    backgroundColor: '#6AC0FF',
  },
};

function slideRenderer(params) {
  const { index, key } = params;
  let style;

  switch (mod(index, 3)) {
    case 0:
      style = styles.slide1;
      break;

    case 1:
      style = styles.slide2;
      break;

    case 2:
      style = styles.slide3;
      break;

    default:
      break;
  }

  return (
    <div style={Object.assign({}, styles.slide, style)} key={key}>
      {`slide n°${index + 1}`}
    </div>
  );
}

class App extends React.Component {
 virtualizeRef;
  constructor(props){
    super(props)
    this.virtualizeRef = React.createRef()
  this.state = {
    index: 0,
  };
  }
  handleChangeIndex = index => {
   // console.log("handle change index is called with index= ",index)
    this.setState({
      index,
    });
  };

  handleClickRightArrow = () => {
    this.setState(prevState=>{
      return{index:prevState.index+1}
    })

    this.virtualizeRef.current.incrementIndexFromParent();
  };
  

  handleClickLeftArrow = () => {
    this.setState(prevState=>{
      return{
      index:prevState.index-1
      }
    })
    this.virtualizeRef.current.decrementIndexFromParent();

  };

  render() {
    return (
      <div>
        <VirtualizeSwipeableViews
          //index={this.state.index}
          onChangeIndex={this.handleChangeIndex}
          slideRenderer={slideRenderer}
          enableMouseEvents
          ref={this.virtualizeRef}
        />
        <br />
        <Button onClick={this.handleClickLeftArrow}>{'<'}</Button>
        <Button onClick={this.handleClickRightArrow}>{'>'}</Button>
        <p>This is example</p>
      </div>
    );
  }
}

export default App;