import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FirebaseContext, AuthContext } from '../src/contexts/FirebaseContext';
import { act } from 'react-dom/test-utils';

// Mock Firebase and Auth functionalities
const mockFirebase = {
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
};

const mockAuth = {
  currentUser: {
    uid: 'testUserId123',
  },
  loading: false,
};

describe('PerformanceSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays performance data for the current user', async () => {
    // Mock successful data fetch
    const mockData = {
      docs: [
        {
          id: 'doc1',
          data: () => ({ userId: 'testUserId123', callsMade: 10, meetingsHeld: 5 }),
        },
        {
          id: 'doc2',
          data: () => ({ userId: 'testUserId123', callsMade: 20, meetingsHeld: 10 }),
        },
      ],
    };
    mockFirebase.db.collection().where().get.mockResolvedValue(mockData);
    await act(async () => {
      render(
        <FirebaseContext.Provider value={mockFirebase}>
          <AuthContext.Provider value={mockAuth}>
            <PerformanceSummary />
          </AuthContext.Provider>
        </FirebaseContext.Provider>
      );
      
      // Wait for data to load
      await waitFor(() => {
        expect(mockFirebase.db.collection).toHaveBeenCalled();
        expect(mockFirebase.db.collection().where).toHaveBeenCalledWith('userId', '==', 'testUserId123');
      });
  
      // Verify data is displayed
      expect(screen.getByText('Calls Made')).toBeInTheDocument();
      expect(screen.getByText('Meetings Held')).toBeInTheDocument();
    });
    
    //Check total calls and meetings
    await waitFor(() => {
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
    });
  });

  it('displays an error message if data cannot be fetched', async () => {
    // Mock data fetch failure
    mockFirebase.db.collection().where().get.mockRejectedValue(new Error('Failed to fetch data'));

    render(
      <FirebaseContext.Provider value={mockFirebase}>
        <AuthContext.Provider value={mockAuth}>
          <PerformanceSummary />
        </AuthContext.Provider>
      </FirebaseContext.Provider>
    );

    // Wait for error message to be displayed
    await waitFor(() => {
        expect(screen.getByText('Error loading performance data.')).toBeInTheDocument();
      });
  });

  it('displays a loading state if the data is loading', async () => {
    const mockAuthLoading = {
      ...mockAuth,
      loading: true,
    };
    render(
      
        <FirebaseContext.Provider value={mockFirebase}>

        <AuthContext.Provider value={mockAuthLoading}>
          <PerformanceSummary />
        </AuthContext.Provider>
      </FirebaseContext.Provider>
    );

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('displays empty data if the user has no data yet', async () => {
    const mockEmptyData = {
      docs: [],
    };
    mockFirebase.db.collection().where().get.mockResolvedValue(mockEmptyData);

    render(
        <FirebaseContext.Provider value={mockFirebase}>
          <AuthContext.Provider value={mockAuth}>
            <PerformanceSummary />
          </AuthContext.Provider>
        </FirebaseContext.Provider>
    );
    await act(async () => {
      await waitFor(() => {
        expect(screen.getByText('No data found for this user.')).toBeInTheDocument();
      });
    });
  });
});