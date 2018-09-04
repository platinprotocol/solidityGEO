pragma solidity ^0.4.24;


/**
 * @author Misha Savchuk
 * @title ConverterLib is library for converting int32 array to bytes and vice versa
 */
library ConvertLib {

    function toInt(bytes memory bArr) internal pure returns(int32[] memory arr) {
        uint bLen = bArr.length;
        //solidity assembly does not support shift bytes operation so we will be divide.
        uint divider = 2** 224;
        uint oneBitDivider = 2** 255;
        arr = new int32[](bLen / 4);

        assembly {
            let mask := 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000
            for { let j := 0 let i:= 0 } lt(i, bLen) { i := add(i, 4) j := add(j, 1)} {
                let shiftedval := div(mload(add(i, add(bArr, 0x20))), divider)
                if eq(1, div(mload(add(i, add(bArr, 0x20))), oneBitDivider)) {
                    shiftedval := add(mask, shiftedval)
                }

                mstore(add(mul(j, 0x20), add(arr, 0x20)), shiftedval)
            }
        }

    }

    function toBytes(int32[] memory arr) internal pure returns(bytes memory bArr) {
        uint len = arr.length;
        uint multi = 2** 224;
        bArr = new bytes(len * 4);

        assembly {
            mstore(bArr, mul(len, 4))
            for { let j := 0 let i:= 0 } lt(j, len) { i := add(i, 0x20) j := add(j, 1)} {
                let shiftedval := mul(mload(add(i, add(arr, 0x20))), multi)
                mstore(add(add(bArr, 0x20), mul(j, 4)), shiftedval)
            }
        }

    }

    function concatStorage(bytes storage shelf, bytes memory postBytes) internal {
        assembly {
        // Read the first 32 bytes of shelf storage, which is the length
        // of the array. (We don't need to use the offset into the slot
        // because arrays use the entire slot.)
            let fslot := sload(shelf_slot)
        // Arrays of 31 bytes or less have an even value in their slot,
        // while longer arrays have an odd value. The actual length is
        // the slot divided by two for odd values, and the lowest order
        // byte divided by two for even values.
        // If the slot is even, bitwise and the slot with 255 and divide by
        // two to get the length. If the slot is odd, bitwise and the slot
        // with -1 and divide by two.
            let slength := div(and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)), 2)
            let mlength := mload(postBytes)
            let newlength := add(slength, mlength)
        // slength can contain both the length and contents of the array
        // if length < 32 bytes so let's prepare for that
            switch add(lt(slength, 32), lt(newlength, 32))
            case 2 {
            // Since the new array still fits in the slot, we just need to
            // update the contents of the slot.
            // uint256(bytes_storage) = uint256(bytes_storage) + uint256(bytes_memory) + new_length
                sstore(
                shelf_slot,
                // all the modifications to the slot are inside this
                // next block
                add(
                // we can just add to the slot contents because the
                // bytes we want to change are the LSBs
                fslot,
                add(
                mul(
                div(
                // load the bytes from memory
                mload(add(postBytes, 0x20)),
                // zero all bytes to the right
                exp(0x100, sub(32, mlength))
                ),
                // and now shift left the number of bytes to
                // leave space for the length in the slot
                exp(0x100, sub(32, newlength))
                ),
                // increase length by the double of the memory
                // bytes length
                mul(mlength, 2)
                )
                )
                )
            }
            case 1 {
            // The stored value fits in the slot, but the combined value
            // will exceed it.
            // get the keccak hash to get the contents of the array
                mstore(0x0, shelf_slot)
                let sc := add(keccak256(0x0, 0x20), div(slength, 32))

            // save new length
                sstore(shelf_slot, add(mul(newlength, 2), 1))

            // The contents of the postBytes array start 32 bytes into
            // the structure. Our first read should obtain the `submod`
            // bytes that can fit into the unused space in the last word
            // of the stored array. To get this, we read 32 bytes starting
            // from `submod`, so the data we read overlaps with the array
            // contents by `submod` bytes. Masking the lowest-order
            // `submod` bytes allows us to add that value directly to the
            // stored value.

                let submod := sub(32, slength)
                let mc := add(postBytes, submod)
                let end := add(postBytes, mlength)
                let mask := sub(exp(0x100, submod), 1)

                sstore(
                sc,
                add(
                and(
                fslot,
                0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00
                ),
                and(mload(mc), mask)
                )
                )

                for {
                    mc := add(mc, 0x20)
                    sc := add(sc, 1)
                } lt(mc, end) {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } {
                    sstore(sc, mload(mc))
                }

                mask := exp(0x100, sub(mc, end))

                sstore(sc, mul(div(mload(mc), mask), mask))
            }
            default {
            // get the keccak hash to get the contents of the array
                mstore(0x0, shelf_slot)
            // Start copying to the last used word of the stored array.
                let sc := add(keccak256(0x0, 0x20), div(slength, 32))

            // save new length
                sstore(shelf_slot, add(mul(newlength, 2), 1))

            // Copy over the first `submod` bytes of the new data as in
            // case 1 above.
                let slengthmod := mod(slength, 32)
                let mlengthmod := mod(mlength, 32)
                let submod := sub(32, slengthmod)
                let mc := add(postBytes, submod)
                let end := add(postBytes, mlength)
                let mask := sub(exp(0x100, submod), 1)

                sstore(sc, add(sload(sc), and(mload(mc), mask)))

                for {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } lt(mc, end) {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } {
                    sstore(sc, mload(mc))
                }

                mask := exp(0x100, sub(mc, end))

                sstore(sc, mul(div(mload(mc), mask), mask))
            }
        }
    }

}