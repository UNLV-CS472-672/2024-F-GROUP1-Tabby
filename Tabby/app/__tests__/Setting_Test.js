// import React from 'react';
// import Setting from '@/components/SettingBar';
// import { fireEvent, render } from '@testing-library/react-native';

describe('Login Screen', () => {

    it('Should go to Setting Display Page', () => {
        //         const navigation = { navigate: () => { } }
        //         jest.spyOn(navigation, 'navigate');

        //         const page = render(<Setting />);

        //         const SettingButton = page.getByTestId('SettingButton');

        //         fireEvent.press(SettingButton);

        //         expect(navigation.navigate).toHaveBeenCalledWith("settingDisplay");

        //         // https://duckduckgo.com/?q=expo+react+how+to+write+test+cases&ia=web
        //         // https://docs.expo.dev/develop/unit-testing/
        //         // https://www.youtube.com/watch?v=Jk5YDUxrg54
    })

})

// import React from 'react';
// import Setting from '@/components/SettingBar';
// import { fireEvent, render } from '@testing-library/react-native';
// import { useRouter } from 'expo-router';

// // Create a mock router that mimics the router.push in the component
// jest.mock('expo-router', () => ({
//     useRouter: jest.fn(),       // Create mock function
// }));

// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: () => mockedNavigate
// }));

// describe('Settings Component', () => {
//     it('Should go to Setting Display Page', () => {
//         // Create mock router.push
//         const mockPush = jest.fn();

//         // Specify that the router will return an object
//         // with the mockPush
//         useRouter.mockReturnValue({ push: mockPush });

//         // Create a 'new' settings button
//         const settingProps = {
//             settingName: 'Test Setting',
//             settingLink: 'anyLink',
//             description: 'Description of Settings'
//         };

//         // Descructure Assignment and only get the TestID from it
//         const { getByTestId } = render(<Setting {...settingProps} />);

//         // Find the settings button via TestID
//         const SettingButton = getByTestId('SettingButton');
//         fireEvent.press(SettingButton);     // Press button

//         // For now we expect it to return to 
//         expect(mockPush).toHaveBeenCalledWith('./anyLink');

//         const navigation = { navigate: () => { } }
//         const mockPush = jest.fn();

//         jest.spyOn(navigation, 'navigate');

//         const page = render(<Setting />);

//         const SettingButton = page.getByTestId('SettingButton');

//         // fireEvent.press(SettingButton);
//         useRouter.mockReturnValue({ push: mockPush });

//         expect(navigation.navigate).toHaveBeenCalledWith("settingDisplay");
//     });
// });

