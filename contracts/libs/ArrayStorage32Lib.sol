pragma solidity ^0.4.24;


/**
 * @author Misha Savchuk
 * @title Array40Lib is library for int32 array.
 */
library ArrayStorage32Lib {

    /**
    * @dev Inserts the specified array at the specified position in this array.
    * Shifts the elements after specified position to the right.
    * @param shelf Array in which elements will be inserted.
    * @param arr Array to be inserted.
    * @param index Index from which the specified array is to be added.
    */
    function addElements(int32[] storage shelf, int32[] memory arr, uint index) internal {
        require(index < shelf.length);

        uint lastOldIndex = shelf.length - 1;
        shelf.length += arr.length;
        for (uint i = lastOldIndex; i >= index; i--)
            shelf[i + arr.length] = shelf[i];

        for (uint j = 0; j < arr.length; j++)
            shelf[j + index] = arr[j];

    }

    /**
    * @dev Add the specified array in this array.
    * @param shelf Array in which elements will be added.
    * @param arr Array to be inserted.
    */
    function addElements(int32[] storage shelf, int32[] memory arr) internal {
        for (uint i = 0; i < arr.length; i++)
            shelf.push(arr[i]);
    }

    /**
    * @dev Remove elements from specified index and reduce the length.
    * Shifts the elements after specified position + amount to the left.
    * @param shelf Array in which elements will be removed.
    * @param amount Amount of elements which will be removed.
    * @param offset Index from which elements will be removed.
    */
    function removeElements(int32[] storage shelf, uint amount, uint offset) internal {
        require(offset + amount < shelf.length);
        uint to = shelf.length - amount - offset;
        for (uint i = 0; i < to; i++) {
            shelf[offset + i] = shelf[offset + i + amount];
        }

        shelf.length -= amount;
    }

    /**
    * @dev Insert element to specified index and increment the array length.
    * @param shelf Array in which element will be added.
    * @param element Element which will be added to this array.
    * @param index Index in which element will be added.
    */
    function addElement(int32[] storage shelf, int32 element, uint index) internal {
        require(index < shelf.length);
        shelf.length++;
        for (uint i = shelf.length - 1; i >= index; i--) {
            shelf[i] = shelf[i - 1];
        }

        shelf[index] = element;
    }

    /**
    * @dev Remove elements from specified index and reduce the length.
    * Shifts the elements after specified position to the left.
    * @param shelf Array from which elements will be removed.
    * @param index Index from which element will be removed.
    */
    function removeElement(int32[] storage shelf, uint index) internal {
        require(index < shelf.length);
        uint to = shelf.length - 1;
        for (uint i = index; i < to; i++) {
            shelf[i] = shelf[i + 1];
        }

        shelf.length--;
    }
}