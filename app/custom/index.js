import CustomContextPad from './CustomContextPad';
import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';

export default {
  //customContextPad
  __init__: [ 'customPalette', 'customRenderer' ],
  //customContextPad: [ 'type', CustomContextPad ],
  customPalette: [ 'type', CustomPalette ],
  customRenderer: [ 'type', CustomRenderer ]

//  __init__: [ 'customPalette' , 'customRenderer'],
//customPalette: [ 'type', CustomPalette ],
//customRenderer: [ 'type', CustomRenderer ]
};

