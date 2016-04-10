/**
 * Expose `unique`
 */

import { getClassSelectors } from './getClasses';
import { getAttributes } from './getAttributes';
import { getNthChild } from './getNthChild';
import { getTag } from './getTag';
import { isUnique } from './isUnique';
import { getParents } from './getParents';


/**
 * Returns all the selectors of the elmenet
 * @param  { Object } element
 * @return { Object }
 */
function getAllSelectors( el, selectors )
{
  const funcs =
    {
      'Tag'        : getTag,
      'NthChild'   : getNthChild,
      'Attributes' : getAttributes,
      'Class'      : getClassSelectors,
    };

  return selectors.reduce( ( res, next ) =>
  {
    res[ next ] = funcs[ next ]( el );
    return res;
  }, {} );
}

/**
 * Tests uniqueNess of the element inside its parent
 * @param  { Object } element
 * @param { String } Selectors
 * @return { Boolean }
 */
function testUniqueness( element, selector )
{
  console.log( selector );
  const { parentNode } = element;
  const elements = parentNode.querySelectorAll( selector );
  return elements.length === 1 && elements[ 0 ] === element;
}

/**
 * Checks all the possible selectors of an element to find one unique and return it
 * @param  { Object } element
 * @param  { Array } items
 * @param  { String } tag
 * @return { String }
 */
function getUniqueCombination( element, items, tag )
{
  const combinations = getCombinations( items );
  console.log( '#####', combinations, items );
  const uniqCombinations = combinations.filter( testUniqueness.bind( this, element ) );
  if( uniqCombinations.length ) return uniqCombinations[ 0 ];

  if( Boolean( tag ) )
  {
    const combinations = items.map( item => tag + item );
    const uniqCombinations = combinations.filter( testUniqueness.bind( this, element ) );
    if( uniqCombinations.length ) return uniqCombinations[ 0 ];
  }

  return null;
}

/**
 * Returns a uniqueSelector based on the passed options
 * @param  { DOM } element
 * @param  { Array } options
 * @return { String }
 */
function getUniqueSelector( el, selectorTypes=['Class', 'Attributes', 'Tag', 'NthChild'] )
{
  let foundSelector;

  const elementSelectors = getAllSelectors( el, selectorTypes );

  for( let selectorType of selectorTypes )
  {
    const { Tag, Class : Classes, Attributes, NthChild } = elementSelectors;
    switch( selectorType )
    {

      case 'Tag':
        if( Boolean( Tag ) && testUniqueness( el, Tag ) )
        {
          return Tag;
        }
        break;

      case 'Class':
        if ( Boolean( Classes ) && Classes.length )
        {
          foundSelector = getUniqueCombination( el, Classes, Tag );
          if( foundSelector )
          {
            return foundSelector;
          }
        }
        break;

      case 'Attributes':
        if ( Boolean( Attributes ) && Attributes.length )
        {
          foundSelector = getUniqueCombination( el, Attributes, Tag );
          if ( foundSelector )
          {
            return foundSelector;
          }
        }
        break;

      case 'NthChild':
        if ( Boolean( NthChild ) )
        {
          return NthChild;
        }
        break;
      default :
        return '*';
    }
  }
  return '*';
}

/**
 * Returns all the possible selector compinations
 */
function getCombinations( items )
{
  items = items ? items : [];
  let result = [[]];
  let i, j, k, l, ref, ref1;

  /**
  * Create array of array with all possibe combimations
  * e.g. an element with 2 classes will have 3 possible combimations
  * ['.classA', '.classB'] -> ['.classA', '.classB', '.classA.classB']
  */
  for ( i = k = 0, ref = items.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k )
  {
    for ( j = l = 0, ref1 = result.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l )
    {
      result.push( result[ j ].concat( items[ i ] ) );
    }
  }

  result.shift();
  result = result.sort( ( a, b ) => a.length - b.length );
  result = result.map( item => item.join( '' ) );
  return result;
}


/**
 * Generate unique CSS selector for given DOM element
 *
 * @param {Element} el
 * @return {String}
 * @api private
 */

export default function unique( el, options={} )
{
  const { selectorTypes=['Class', 'Attributes', 'Tag', 'NthChild'] } = options;
  const allSelectors = [];
  const parents = getParents( el );

  for( let elem of parents )
  {
    const selector = getUniqueSelector( elem, selectorTypes );
    if( Boolean( selector ) )
    {
      allSelectors.push( selector );
    }
  }

  const selectors = [];
  for( let it of allSelectors )
  {
    selectors.unshift( it );
    const selector = selectors.join( ' > ' );
    if( isUnique( el, selector ) )
    {
      return selector;
    }
  }

  return null;
}
