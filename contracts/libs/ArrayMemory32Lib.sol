pragma solidity ^0.4.24;


/**
 * @author Misha Savchuk
 * @title ArrayMemory32Lib is library for int array.
 */
library ArrayMemory32Lib {

    /**
    * @dev Inserts the specified array at the specified position in this array.
    * Shifts the elements after specified position to the right.
    * @param shelf Array in which elements will be inserted.
    * @param arr Array to be inserted.
    * @param index Index from which the specified array is to be added.
    */
    function addElements(int32[] memory shelf, int32[] memory arr, uint index)
        internal
        pure
        returns(int32[] memory)
    {
        require(index < shelf.length);

        int32[] memory newArray = new int32[](shelf.length + arr.length);

        uint i = 0;
        for (; i < index; i++)
            newArray[i] = shelf[i];

        for (uint j = 0; j < arr.length; j++) {
            newArray[i] = arr[j];
            i++;
        }

        for (uint k = index; k < shelf.length; k++) {
            newArray[i] = shelf[k];
            i++;
        }

        return newArray;
    }

    /**
    * @dev Add the specified array in this array.
    * @param shelf Array in which elements will be added.
    * @param arr Array to be inserted.
    */
    function addElements(int32[] memory shelf, int32[] memory arr)
        internal
        pure
        returns(int32[] memory)
    {
        int32[] memory newArray = new int32[](shelf.length + arr.length);
        uint i = 0;
        for (; i < shelf.length; i++)
            newArray[i] = shelf[i];

        for (uint j = 0; j < arr.length; j++)
            newArray[i + j] = arr[j];

        return newArray;
    }

    /**
    * @dev Remove elements from specified index and reduce the length.
    * Shifts the elements after specified position + amount to the left.
    * @param shelf Array in which elements will be removed.
    * @param amount Amount of elements which will be removed.
    * @param offset Index from which elements will be removed.
    */
    function removeElements(int32[] memory shelf, uint amount, uint offset)
        internal
        pure
        returns(int32[] memory)
    {
        require(offset + amount < shelf.length);
        int32[] memory newArray = new int32[](shelf.length - amount);
        for (uint i = 0; i < newArray.length; i++) {
            if (i < offset)
                newArray[i] = shelf[i];
            else
                newArray[i] = shelf[i + amount];
        }

        return newArray;
    }

    /**
    * @dev Insert element to specified index and increment the array length.
    * @param shelf Array in which element will be added.
    * @param element Element which will be added to this array.
    * @param index Index in which element will be added.
    */
    function addElement(int32[] memory shelf, int32 element, uint index)
        internal
        pure
        returns(int32[] memory)
    {
        require(index < shelf.length);
        int32[] memory newArray = new int32[](shelf.length + 1);

        for (uint i = 0; i < shelf.length; i++) {
            if (i == index)
                continue;

            newArray[i] = shelf[i];
        }

        newArray[index] = element;

        return newArray;
    }

    /**
    * @dev Remove elements from specified index and reduce the length.
    * Shifts the elements after specified position to the left.
    * @param shelf Array from which elements will be removed.
    * @param index Index from which element will be removed.
    */
    function removeElement(int32[] memory shelf, uint index)
        internal
        pure
        returns(int32[] memory)
    {
        require(index < shelf.length);
        int32[] memory newArray = new int32[](shelf.length - 1);
        for (uint i = 0; i < newArray.length; i++) {
            if (i < index)
                newArray[i] = shelf[i];
            else
                newArray[i] = shelf[i + 1];
        }

        return newArray;
    }
}