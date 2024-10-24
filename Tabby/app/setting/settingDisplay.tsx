import { Text } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';

const Display = () => {

    return (
        <SafeAreaView>
            <Text className="text-white text-center">
                Hello From Display
            </Text>
        </SafeAreaView>
    )
}

export default Display;
