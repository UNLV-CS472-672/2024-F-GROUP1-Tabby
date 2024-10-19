import { Text, Image } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Prop {
    icon: string,
    pageLink: React.ReactElement<typeof Link>,
    description: string
}

const SettingBar:React.FC<Prop> = ({icon, pageLink, description}) => {
    return (
        <SafeAreaView className="items-left">
            <Image 
                source={{uri: "/assets/images/icon.png",}}
                className="w-8 h-8 mr-8"
            />

            <Text className="text-white text-left">
                {pageLink}
            </Text>

            <Text className="text-gray-400">
                {description}
            </Text>

        </SafeAreaView>
    )
}
// https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDGMA0cDecCuAzksgGZwC+cpUEIcA5FKhgwFCiSy5wDKSAGyQZsAYSQA7GEijYAYkIAe86CFEQptAdgCSEsPixwAQoZgbsAFSSKYKZikrVa9AEQABNAAsUAaygoALT4wAD0DhiubGxoGoTwAIJgYABciCwwAHRyonAAvHAAFACU+QB8uGxwcLES8XAwwDBCZPkExK0APHAAEpYAsgAyegYwAKJCIJLwFYUS+AICxVU1cfAwAJ5gJEjkBUQ75N19Q-xCGBNIU1Jws-OLyyu19QAmSIRoUMBgjRqt+x1dnBjgNBtZbAkHJdrjMivcltFqs94BpePgAEYgJo9FASF5CKBtQpINLIdBZOSqMYAN2mxTS1IgwBe5Uq1WqSEyYGYtKkABFdigFjASojKGLkXBRAB5Qa8NoARgA3E81ohpQB1eUFZVi5gwfBQCRFFbVTpkjDZAIAcxhZVN7JwoQAVMCAHIoano+xwUJlZ2hCgOs3iKQyOAAd2ZMC8eVcCoADAmAKSuOBeJDAa1eGBxgCcAFZqV5XPb2eXgQobHAAFZERqkDbqMNSONoaYyNMoARZiQ6aQgQhtjtQNNRl4xuMFhPUiOl4MVzqUqBqDQwLQNGwwBI960SYdh0dwVEYrG5nAnzHY3H4mQUMsVx+dEaGODMUh5HCNZqHKhgAToEgXgQAIbxQHGHpTNQ0BwBsECGm+wjfEgaZ+guT5nMIMCWFsSCIaQAAKtBgJ+mzbGQVBoY+T7gnYDj4Z+bwfF8PzAH8ux-gB7bAaBMhxgKzHfL8EhprEAhDjgMpylQtARhJCCarwMnvMAABeSBxhIGgob6D7UeynSmDA5jGmRGmuIQp5NKWaJXjAnShEZJl6dRDnLqumggS55ZuUo3nAqEobSFALkORaFI2naYrLEGMRqphGA4dspIZNkoidHg75ERAqTpOSmRkNK6I1lhnQnHKghYdC0wVPeRLcjlhClHkFQ4Cs+qGsahQOp0CXwO+n4NWAhCZFlxH3gunQ5cJZTGA4vikCg8QOdNbESP5U2sRoZSDPgEjeCtW3rZNq3bXywASBIMiHTNJ1HWUaLJNdoSncdPmhH1D4xWwQA

export default SettingBar;